import React from 'react'
import { Box, Text, Button, Input, createToaster, AvatarRoot, AvatarImage, AvatarFallback } from '@chakra-ui/react';
import { useChat } from '../context/ChatProvider';
import { getSenderFull, getSender } from '../config/ChatLogics';
import ProfileModal from './Authentication/miscellaneous/ProfileModal';
import UpdateGroupChat from './Authentication/miscellaneous/UpdateGroupChat';
import axios from 'axios';
import { useEffect } from 'react';
import { io } from 'socket.io-client';



const ENDPOINT =  "http://localhost:5000";
let socket, selectedChatCompare;



const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const { user, selectedChat, setSelectedChat, setNotifications } = useChat();
    const [messages, setMessages] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [newMessage, setNewMessage] = React.useState("");
    
    const toaster = createToaster({
        placement: "bottom",
    });
    
    const loggedUser = JSON.parse(localStorage.getItem("userInfo"));
    const currentUser = user || loggedUser;
    const messagesEndRef = React.useRef(null);
    const currentRoomRef = React.useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const playNotificationSound = () => {
        // Create a simple notification sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    useEffect(() => {
        // Request notification permission
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
        
        if (currentUser) {
            socket = io(ENDPOINT);
            socket.emit("setup", currentUser);
            socket.on("connected", () => console.log("Connected to Socket.IO"));
            
            // Listen for new messages
            socket.on("message received", (newMessageReceived) => {
                if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                    // Add to notifications if not currently viewing this chat
                    setNotifications(prevNotifications => {
                        if (!prevNotifications.find(notif => notif._id === newMessageReceived._id)) {
                            setFetchAgain(prev => !prev);
                            
                            // Play notification sound
                            playNotificationSound();
                            
                            // Show browser notification
                            if (Notification.permission === "granted") {
                                new Notification(`New message from ${newMessageReceived.sender.name}`, {
                                    body: newMessageReceived.content,
                                    icon: newMessageReceived.sender.pic || '/default-avatar.png',
                                    tag: newMessageReceived.chat._id
                                });
                            }
                            
                            // Show toast notification
                            toaster.create({
                                title: `New message from ${newMessageReceived.sender.name}`,
                                description: newMessageReceived.content,
                                status: "info",
                                duration: 4000,
                            });
                            
                            return [newMessageReceived, ...prevNotifications];
                        }
                        return prevNotifications;
                    });
                } else {
                    setMessages(prevMessages => [...prevMessages, newMessageReceived]);
                }
            });
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [currentUser._id]); // Only depend on user ID

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = React.useCallback(async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            };

            setLoading(true);
            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );
            
            setMessages(data);
            setLoading(false);
        } catch (error) {
            toaster.create({
                title: "Error occurred!",
                description: "Failed to load the messages",
                status: "error",
                duration: 5000,
            });
            setLoading(false);
        }
    }, [selectedChat?._id, currentUser?.token]);

    React.useEffect(() => {
        if (selectedChat && selectedChat._id !== currentRoomRef.current) {
            fetchMessages();
            selectedChatCompare = selectedChat;
            
            // Only join room if it's different from current room
            if (socket && selectedChat._id !== currentRoomRef.current) {
                socket.emit("join chat", selectedChat._id);
                currentRoomRef.current = selectedChat._id;
            }
            
            // Clear notifications for this chat when opened
            setNotifications(prevNotifications => 
                prevNotifications.filter(notif => notif.chat._id !== selectedChat._id)
            );
        }
    }, [selectedChat?._id]);

    const sendMessage = async (event) => {
        if (event.key === "Enter" || event.type === "click") {
            if (!newMessage.trim()) {
                return;
            }

            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                };

                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    config
                );

                setMessages([...messages, data]);
                socket.emit("new message", data);
                setFetchAgain(!fetchAgain);
            } catch (error) {
                toaster.create({
                    title: "Error occurred!",
                    description: "Failed to send the message",
                    status: "error",
                    duration: 5000,
                });
            }
        }
    };

    const typingHandler = (e) => {
        setNewMessage(e.target.value);
    };

    // Helper function to determine if we should show profile pic
    const shouldShowAvatar = (messages, index) => {
        const currentMessage = messages[index];
        const nextMessage = messages[index + 1];
        
        // Always show avatar if it's the last message
        if (index === messages.length - 1) return true;
        
        // Show avatar if next message is from different sender
        if (nextMessage && nextMessage.sender._id !== currentMessage.sender._id) return true;
        
        return false;
    };


  return (
    <>
      {selectedChat ? (
        <Box
          width="100%"
          height="100%"
          display="flex"
          flexDirection="column"
        >
          {/* Chat Header */}
          <Box
            display="flex"
            pb={3}
            px={2}
            width="100%"
            alignItems="center"
            borderBottomWidth="1px"
            borderColor="gray.200"
          >
            <Button
              display={{ base: "flex", md: "none" }}
              onClick={() => setSelectedChat("")}
              variant="ghost"
              size="sm"
              mr={2}
              fontSize="lg"
            >
              ←
            </Button>
            <Box display="flex" alignItems="center" flex="1">
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="bold"
                fontFamily="Work Sans"
                color="gray.700"
                mr={3}
              >
                {!selectedChat.isGroupChat ? (
                  <>
                    {currentUser && selectedChat.users && selectedChat.users.length >= 2 
                      ? getSender(currentUser, selectedChat.users)
                      : "Loading user data..."
                    }
                  </>
                ) : (
                  <>
                    {selectedChat.chatName ? selectedChat.chatName.toUpperCase() : "GROUP CHAT"}
                     <UpdateGroupChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
                  </>
                )}
              </Text>
              {!selectedChat.isGroupChat && currentUser && selectedChat.users && selectedChat.users.length >= 2 && (
                <ProfileModal user={getSenderFull(currentUser, selectedChat.users)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    color="gray.600"
                    _hover={{ color: "blue.500", bg: "gray.100" }}
                    borderRadius="full"
                    minW="auto"
                    h="auto"
                    p={2}
                    fontSize="lg"
                  >
                    👁️
                  </Button>
                </ProfileModal>
              )}
            </Box>
          </Box>
          
          {/* Chat Messages Area */}
          <Box
            display={"flex"}
            flexDirection="column"
            justifyContent={"flex-end"}
            p={3}
            bg="#E8E8E8"
            width={"100%"}
            height="100%"
            borderRadius="lg"
            overflowY="hidden"
            flex="1"
          >
            {/* Messages Container */}
            <Box
              display="flex"
              flexDirection="column"
              overflowY="auto"
              scrollBehavior="smooth"
              flex="1"
              mb={3}
              maxHeight="100%"
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#a8a8a8',
                },
              }}
            >
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Text color="gray.500">Loading messages...</Text>
                </Box>
              ) : messages.length > 0 ? (
                <>
                  {messages.map((m, i) => {
                    const isMyMessage = m.sender._id === currentUser._id;
                    const showAvatar = shouldShowAvatar(messages, i);
                    
                    return (
                      <Box
                        key={m._id || i}
                        display="flex"
                        mb={1}
                        justifyContent={isMyMessage ? "flex-end" : "flex-start"}
                        alignItems="flex-end"
                        gap={2}
                      >
                        {/* Left side avatar for received messages */}
                        {!isMyMessage && (
                          <Box width="40px" display="flex" justifyContent="center">
                            {showAvatar ? (
                              <AvatarRoot size="sm">
                                <AvatarImage
                                  src={m.sender.pic}
                                  alt={m.sender.name}
                                />
                                <AvatarFallback>
                                  {m.sender.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </AvatarRoot>
                            ) : (
                              <Box width="32px" height="32px" />
                            )}
                          </Box>
                        )}

                        {/* Message bubble */}
                        <Box
                          bg={isMyMessage ? "#BEE3F8" : "#B9F5D0"}
                          maxWidth="75%"
                          borderRadius="lg"
                          px={3}
                          py={2}
                          wordBreak="break-word"
                          boxShadow="sm"
                          mb={showAvatar ? 2 : 0}
                        >
                          {/* Sender Name - Show for group chats and only when showing avatar */}
                          {selectedChat.isGroupChat && showAvatar ? (
                            <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                              {isMyMessage ? "You" : m.sender.name}
                            </Text>
                          ) : (
                            !selectedChat.isGroupChat && !isMyMessage && showAvatar && (
                              <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                                {m.sender.name}
                              </Text>
                            )
                          )}
                          
                          {/* Message Content */}
                          <Text fontSize="sm" mb={1}>{m.content}</Text>
                          
                          {/* Timestamp - Only show on last consecutive message */}
                          {showAvatar && (
                            <Text fontSize="xs" color="gray.500" textAlign="right">
                              {new Date(m.createdAt).toLocaleString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Text>
                          )}
                        </Box>

                        {/* Right side space for sent messages (to maintain alignment) */}
                        {isMyMessage && (
                          <Box width="40px" />
                        )}
                      </Box>
                    );
                  })}
                  {/* Invisible div to scroll to */}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Text color="gray.500" textAlign="center">
                    Start a conversation with {!selectedChat.isGroupChat 
                      ? (currentUser && selectedChat.users ? getSender(currentUser, selectedChat.users) : "user")
                      : selectedChat.chatName}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Message Input */}
            <Box mt="auto">
              <Box display="flex" gap={2}>
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message..."
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={sendMessage}
                  flex="1"
                  _focus={{
                    bg: "white",
                    borderColor: "blue.300"
                  }}
                />
                <Button
                  colorScheme="blue"
                  onClick={sendMessage}
                  isDisabled={!newMessage.trim()}
                  px={6}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Box>

        </Box>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Text fontSize="3xl" color="gray.500" fontFamily="Work Sans">
            Select a chat to start messaging
          </Text>
        </Box>
      )}
    </>
  )
}

export default SingleChat;
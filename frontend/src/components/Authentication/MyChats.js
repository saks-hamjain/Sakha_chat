import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, Button, Input } from '@chakra-ui/react';
import { useChat } from '../../context/ChatProvider';
import axios from 'axios';
import { getSender } from '../../config/ChatLogics';
import Chatloading from '../Chatloading';
// import GroupChatModal from './miscellaneous/GroupChatModal';

// Move GroupChatModal outside to prevent recreation
const GroupChatModal = React.memo(({ 
  children, 
  isModalOpen, 
  onOpen, 
  onClose, 
  groupChatName, 
  onGroupChatNameChange,
  search,
  onSearchChange,
  loading,
  searchResults,
  selectedUsers,
  onAddUser,
  onRemoveUser,
  onCreateGroup
}) => {
  return (
    <>
      <span onClick={onOpen}>{children}</span>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <Box 
            position="fixed" 
            top={0} 
            left={0} 
            right={0} 
            bottom={0} 
            bg="blackAlpha.600" 
            zIndex={999}
            onClick={onClose}
          />
          {/* Modal */}
          <Box 
            position="fixed" 
            top="50%" 
            left="50%" 
            transform="translate(-50%, -50%)" 
            bg="white" 
            p={6} 
            borderRadius="md" 
            boxShadow="lg"
            zIndex={1000}
            width="400px"
            maxWidth="90vw"
          >
            <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
              Create Group Chat
            </Text>
            
            <Box mb={4}>
              <Box mb={3}>
                <Text mb={1} fontSize="sm" fontWeight="medium">Chat Name:</Text>
                <Input 
                  placeholder="Enter chat name" 
                  value={groupChatName}
                  onChange={onGroupChatNameChange}
                  size="md"
                />
              </Box>
              <Box>
                <Text mb={1} fontSize="sm" fontWeight="medium">Add Users:</Text>
                <Input 
                  placeholder="Search users to add" 
                  value={search}
                  onChange={onSearchChange}
                  size="md"
                />
              </Box>
            </Box>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <Box mb={4}>
                <Text mb={2} fontSize="sm" fontWeight="medium">Selected Users:</Text>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {selectedUsers.map((user) => (
                    <Box  
                      key={user._id}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      bg="gray.100"
                      borderRadius="md"
                      p={2}
                      width="100%"
                    > 
                      <Text>{user.name}</Text>
                      <Button 
                        size="sm"
                        colorScheme="red"
                        onClick={() => onRemoveUser(user._id)}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {loading ? <div>Loading...</div> : (
              searchResults.length > 0 ? (
                <Box mt={3}>
                  {searchResults.map((user) => {
                    const isAlreadySelected = selectedUsers.some(selectedUser => selectedUser._id === user._id);
                    return (
                      <Box key={user._id} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Text>{user.name}</Text>
                        <Button
                          size="sm"
                          colorScheme={isAlreadySelected ? "gray" : "blue"}
                          onClick={() => onAddUser(user)}
                          isDisabled={isAlreadySelected}
                        >
                          {isAlreadySelected ? "Added" : "Add"}
                        </Button>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                search && <Text mt={3} color="gray.500">No users found</Text>
              )
            )}
            
            <Box display="flex" justifyContent="space-between" gap={3} mt={4}>
              <Button variant="outline" onClick={onClose} flex={1} isDisabled={loading}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={onCreateGroup}
                flex={1}
                isLoading={loading}
                loadingText="Creating..."
              >
                Create Chat
              </Button>
            </Box>
          </Box>
        </>
      )}
    </>
  );
});

const MyChats = ({ fetchAgain, setFetchAgain }) => {
  const [loggeduser, setLoggedUser] = useState();
  const {selectedChat, setSelectedChat, user, Chats, setChats, notifications } = useChat(); 
  
  // Search functionality for GroupChatModal
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  // GroupChatModal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  
  const handlegroup = useCallback((userToAdd) => {
    // Check if user is already selected by comparing IDs
    if (selectedUsers.some(user => user._id === userToAdd._id)) {
      alert("User already added");
      return;
    }
    setSelectedUsers(prev => [...prev, userToAdd]);
    setSearch("");
    setSearchResults([]);
  }, [selectedUsers]);

  const handleSearch = useCallback(async (query) => {
    setSearch(query);
    if(!query) {
      setSearchResults([]);
      return; 
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setLoading(false);
    }
  }, [user]);

  const handleGroupChatNameChange = useCallback((e) => {
    setGroupChatName(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    handleSearch(e.target.value);
  }, [handleSearch]);

  const handleModalOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setGroupChatName("");
    setSearch("");
    setSearchResults([]);
    setSelectedUsers([]);
  }, []);

  const handleRemoveUser = useCallback((userId) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  }, []);

  const handleCreateGroup = useCallback(async () => {
    if (!groupChatName.trim()) {
      alert("Please enter a chat name");
      return;
    }

    if (selectedUsers.length < 2) {
      alert("Please select at least 2 users for a group chat");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      };

      // Prepare the user IDs array (backend expects JSON string)
      const userIds = selectedUsers.map(user => user._id);

      const { data } = await axios.post(
        '/api/chat/group',
        {
          name: groupChatName.trim(),
          users: JSON.stringify(userIds),
        },
        config
      );

      // Add the new group chat to the chats list
      setChats(prev => [data, ...prev]);
      
      // Select the newly created group chat
      setSelectedChat(data);
      
      // Trigger refresh for other components
      setFetchAgain(prev => !prev);
      
      setLoading(false);
      handleModalClose();
      
      alert(`Group chat "${groupChatName}" created successfully!`);
      
    } catch (error) {
      setLoading(false);
      console.error("Error creating group chat:", error);
      
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to create group chat. Please try again.');
      }
    }
  }, [groupChatName, selectedUsers, user, setChats, setSelectedChat, setFetchAgain, handleModalClose]);

  const fetchChats = useCallback(async () => {
    if (!user || !user.token) {
      console.log("MyChats: No user or token available");
      return;
    }
    
    try {
         const config = {
          headers:{
            Authorization: `Bearer ${user.token}`,
          },
         };

         const { data } = await axios.get('/api/chat', config);
          setChats(data);
        }
        catch (error) {
          console.error("MyChats fetchChats error:", error);
          alert('Failed to load chats');
        }
      }, [user, setChats]);

  useEffect(() => { 
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchChats, user, fetchAgain]);

  // Add safety check
  if (!user) {
    return (
      <Box p={4}>
        <Text>Loading user...</Text>
      </Box>
    );
  }

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection={"column"}
      alignItems={"center"}
      width={{ base: "100%", md: "31%" }}
      bg="rgba(255, 255, 255, 0.9)"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      p={3}
      minHeight="100%"
      backdropFilter="blur(10px)"
    >
      <Box 
        display="flex" 
        width="100%" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Text fontSize="lg" fontWeight="bold">
            My Chats
          </Text>
          {notifications?.length > 0 && (
            <Box
              bg="red.500"
              color="white"
              borderRadius="full"
              minWidth="24px"
              height="24px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="sm"
              fontWeight="bold"
            >
              {notifications.length > 99 ? "99+" : notifications.length}
            </Box>
          )}
        </Box>
        <GroupChatModal
          isModalOpen={isModalOpen}
          onOpen={handleModalOpen}
          onClose={handleModalClose}
          groupChatName={groupChatName}
          onGroupChatNameChange={handleGroupChatNameChange}
          search={search}
          onSearchChange={handleSearchChange}
          loading={loading}
          searchResults={searchResults}
          selectedUsers={selectedUsers}
          onAddUser={handlegroup}
          onRemoveUser={handleRemoveUser}
          onCreateGroup={handleCreateGroup}
        >
          <Button 
            fontSize={{ base: "14px", md: "10px", lg: "14px" }}
            size="sm"
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      <Box width="100%">
        {Chats && Array.isArray(Chats) ? (
          <Box width="100%">
            {Chats.map((chat) => {
              const unreadCount = notifications?.filter(notif => notif.chat._id === chat._id).length || 0;
              
              return (
              <Box
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                borderRadius="lg"
                mb={2}
                width="100%"
                minWidth="200px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                textAlign="center"
                p={3}
                position="relative"
              >
                <Text fontWeight="bold" flex="1">
                  {!chat.isGroupChat ? (
                    getSender(loggeduser, chat.users)
                  ) : (
                    chat.chatName
                  )}
                </Text>
                
                {/* Notification Badge */}
                {unreadCount > 0 && (
                  <Box
                    bg="red.500"
                    color="white"
                    borderRadius="full"
                    minWidth="20px"
                    height="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    fontWeight="bold"
                    ml={2}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Box>
                )}
              </Box>
              );
            })}
          </Box>
        ) : (
          <Chatloading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
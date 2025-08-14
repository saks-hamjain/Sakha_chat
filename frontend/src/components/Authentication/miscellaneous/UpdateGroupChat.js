import React, { useState } from 'react'
import { 
    Button, 
    CloseButton, 
    Dialog, 
    Portal, 
    Text, 
    Box,
    Input
} from "@chakra-ui/react"
import { useChat } from '../../../context/ChatProvider';
import axios from 'axios';

const UpdateGroupChat = ({ fetchAgain, setFetchAgain, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);
    
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const { selectedChat, setSelectedChat, user } = useChat();

    const handleRemove = async (userToRemove) => {
        if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
            alert("Only admins can remove other users!");
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(
                '/api/chat/groupremove',
                {
                    chatId: selectedChat._id,
                    userId: userToRemove._id,
                },
                config
            );

            userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
            
            if (userToRemove._id === user._id) {
                alert("You have left the group");
                onClose();
            } else {
                alert(`${userToRemove.name} has been removed from the group`);
            }
        } catch (error) {
            alert("Error occurred while removing user");
            setLoading(false);
        }
    };

    const handleRename = async () => {
        if (!groupChatName || groupChatName.trim() === "") {
            alert("Please enter a group name");
            return;
        }

        if (selectedChat.groupAdmin._id !== user._id) {
            alert("Only admins can rename the group!");
            return;
        }

        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(
                '/api/chat/rename',
                {
                    chatId: selectedChat._id,
                    chatName: groupChatName.trim(),
                },
                config
            );

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
            setGroupChatName("");
            alert("Group name updated successfully!");
        } catch (error) {
            alert("Error occurred while renaming group");
            setRenameLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            setSearchResult([]);
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            alert("Error occurred while searching users");
            setLoading(false);
        }
    };

    const handleAddUser = async (userToAdd) => {
        if (selectedChat.groupAdmin._id !== user._id) {
            alert("Only admins can add new members!");
            return;
        }

        if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
            alert("User is already in the group!");
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                '/api/chat/groupadd',
                {
                    chatId: selectedChat._id,
                    userId: userToAdd._id,
                },
                config
            );

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
            setSearch("");
            setSearchResult([]);
            alert(`${userToAdd.name} has been added to the group!`);
        } catch (error) {
            alert("Error occurred while adding user");
            setLoading(false);
        }
    };
    return (
        <>
            {children ? (
                <span onClick={onOpen}>{children}</span>
            ) : (
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
                    onClick={onOpen}
                >
                    👁️
                </Button>
            )}
            
            <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="lg" centered>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header alignItems="center" display="flex" justifyContent="space-between">
                                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                                    <Text fontSize="2xl" fontWeight="bold">{selectedChat.chatName}</Text>
                                    <Dialog.CloseTrigger asChild>
                                        <CloseButton />
                                    </Dialog.CloseTrigger>
                                </Box>
                            </Dialog.Header>
                            <Dialog.Body>
                                {/* Rename Group Section */}
                                <Box mb={6}>
                                    <Text fontSize="lg" mb={3} fontWeight="bold">Rename Group</Text>
                                    <Box display="flex" gap={2} alignItems="center">
                                        <Input
                                            placeholder={selectedChat.chatName}
                                            value={groupChatName}
                                            onChange={(e) => setGroupChatName(e.target.value)}
                                            isDisabled={selectedChat.groupAdmin._id !== user._id}
                                        />
                                        <Button
                                            colorScheme="blue"
                                            onClick={handleRename}
                                            isLoading={renameLoading}
                                            isDisabled={selectedChat.groupAdmin._id !== user._id}
                                            loadingText="Renaming..."
                                        >
                                            Update
                                        </Button>
                                    </Box>
                                    {selectedChat.groupAdmin._id !== user._id && (
                                        <Text fontSize="sm" color="red.500" mt={1}>
                                            Only group admin can rename the group
                                        </Text>
                                    )}
                                </Box>

                                {/* Group Members Section */}
                                <Text fontSize="lg" mb={4} fontWeight="bold">Group Members</Text>
                                <Box mb={4}>
                                    {selectedChat.users.map((u) => (
                                        <Box 
                                            key={u._id} 
                                            display="flex" 
                                            alignItems="center" 
                                            justifyContent="space-between"
                                            mb={2} 
                                            p={3} 
                                            borderRadius="md" 
                                            bg="gray.50"
                                            border="1px solid"
                                            borderColor="gray.200"
                                        >
                                            <Box>
                                                <Text fontSize="md" fontWeight="medium">
                                                    {u.name}
                                                    {selectedChat.groupAdmin._id === u._id && (
                                                        <Text as="span" fontSize="sm" color="blue.500" ml={2}>
                                                            (Admin)
                                                        </Text>
                                                    )}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">{u.email}</Text>
                                            </Box>
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                variant="outline"
                                                onClick={() => handleRemove(u)}
                                                isLoading={loading}
                                                isDisabled={
                                                    selectedChat.groupAdmin._id !== user._id && u._id !== user._id
                                                }
                                            >
                                                {u._id === user._id ? "Leave Group" : "Remove"}
                                            </Button>
                                        </Box>
                                    ))}
                                </Box>
                                
                                {/* Add Members Section - Only show for admin */}
                                {selectedChat.groupAdmin._id === user._id && (
                                    <Box mb={4}>
                                        <Text fontSize="lg" fontWeight="semibold" mb={3}>
                                            Add Members
                                        </Text>
                                        
                                        <Input
                                            placeholder="Search users by name or email..."
                                            value={search}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            mb={3}
                                        />
                                        
                                        {searchResult.length > 0 && (
                                            <Box>
                                                <Text fontSize="md" fontWeight="medium" mb={2}>
                                                    Search Results:
                                                </Text>
                                                <Box maxH="200px" overflowY="auto">
                                                    {searchResult.slice(0, 4).map((searchUser) => (
                                                        <Box
                                                            key={searchUser._id}
                                                            display="flex"
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                            p={3}
                                                            mb={2}
                                                            bg="gray.50"
                                                            borderRadius="md"
                                                            border="1px solid"
                                                            borderColor="gray.200"
                                                        >
                                                            <Box>
                                                                <Text fontSize="md" fontWeight="medium">
                                                                    {searchUser.name}
                                                                </Text>
                                                                <Text fontSize="sm" color="gray.600">
                                                                    {searchUser.email}
                                                                </Text>
                                                            </Box>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="green"
                                                                variant="outline"
                                                                onClick={() => handleAddUser(searchUser)}
                                                                isLoading={loading}
                                                                isDisabled={
                                                                    selectedChat.users.some(u => u._id === searchUser._id)
                                                                }
                                                            >
                                                                {selectedChat.users.some(u => u._id === searchUser._id) 
                                                                    ? "Already Added" 
                                                                    : "Add"
                                                                }
                                                            </Button>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                                
                                <Text fontSize="sm" color="gray.500" textAlign="center">
                                    {selectedChat.groupAdmin._id === user._id 
                                        ? "As admin, you can remove any member and add new members" 
                                        : "You can only remove yourself from the group"
                                    }
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button colorScheme="blue" onClick={onClose}>Close</Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    )
}

export default UpdateGroupChat;
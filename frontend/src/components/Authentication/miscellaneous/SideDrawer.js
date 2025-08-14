import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    Text, 
    Input,
    Menu,
    Portal,
    Spinner
} from '@chakra-ui/react';
import { useChat } from '../../../context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chatloading from '../../Chatloading';

export const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const { user, setUser, setSelectedChat, Chats, setChats }  = useChat();
    const navigate = useNavigate();
    
    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/');
    };
    
    const accessChat = async (userId) => {
        try {   
            setLoading(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post('/api/chat', { userId }, config);

            if(!Chats.find(chat => chat._id === data._id)) {
                setChats([data, ...Chats]);
            }
            setSelectedChat(data);
            setLoading(false);
            setSearchResult([]);
            onClose();
        } catch (error) {
            setLoading(false);
            alert('Error: Failed to access chat');
            console.error(error);
        }
    };
    const handleSearch = async () => {
        if (!search) {
           alert('Please enter a search term');
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
            setLoading(false);
            alert('Error: Failed to Load the Search Results');
        }
    }   
    return (
        <>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                padding="5px 10px"
                bg="rgba(255, 255, 255, 0.9)"
                width="100%"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="lg"
                boxShadow="sm"
                marginBottom="10px"
                backdropFilter="blur(10px)"
            >
                <Button variant="ghost" onClick={onOpen}>
                    <Text>🔍</Text>
                    <Text display={{ base: "none", md: "flex" }} px={4}>
                        Search Users
                    </Text>
                </Button>
                
                <Text fontSize="2xl" fontFamily="Work Sans" fontWeight="bold">
                    Sakha Chat
                </Text>
                
                <Box>
                    <Menu.Root>
                        <Menu.Trigger asChild>
                          <Button variant="ghost" mr={2}>
                           <Text>🔔</Text>
                         </Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content>
                                    <Box p={4}>
                                        <Text fontSize="lg" fontWeight="bold">Notifications</Text>
                                        <Text mt={2} color="gray.500">No new notifications</Text>
                                    </Box>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                    
                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <Button variant="ghost" borderRadius="full" p={1}>
                                {user?.pic ? (
                                    <Box
                                        width="32px"
                                        height="32px"
                                        borderRadius="full"
                                        overflow="hidden"
                                        bg="gray.200"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <img 
                                            src={user.pic} 
                                            alt={user.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Box
                                        width="32px"
                                        height="32px"
                                        borderRadius="full"
                                        bg="blue.500"
                                        color="white"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        fontSize="sm"
                                        fontWeight="bold"
                                    >
                                        {user?.name?.[0]?.toUpperCase() || "👤"}
                                    </Box>
                                )}
                            </Button>
                         </Menu.Trigger>
                         <Portal>
                            <Menu.Positioner>
                                <Menu.Content>
                                    <Box p={4}>
                                        <ProfileModal user={user}>
                                            <Button mt={2} width="100%" variant="ghost">
                                                View Profile
                                            </Button>
                                        </ProfileModal>
                                        <Button mt={2} width="100%" onClick={logoutHandler}>
                                            Logout
                                        </Button>
                                    </Box>
                                </Menu.Content>
                            </Menu.Positioner>
                         </Portal>
                    </Menu.Root>
                    
                </Box>
            </Box>
            
            {/* Search Overlay */}
            {isOpen && (
                <Box
                    position="fixed"
                    top="0"
                    left="0"
                    width="100vw"
                    height="100vh"
                    bg="rgba(0, 0, 0, 0.5)"
                    zIndex="1000"
                    onClick={onClose}
                >
                    <Box
                        position="absolute"
                        top="0"
                        left="0"
                        width="300px"
                        height="100vh"
                        bg="rgba(255, 255, 255, 0.95)"
                        backdropFilter="blur(10px)"
                        p={4}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Text fontSize="lg" fontWeight="bold" mb={4} borderBottomWidth="1px" pb={2}>
                            Search Users
                        </Text>
                        <Box display="flex" mb={4}>
                            <Input
                                placeholder="Search by name or email"
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch} isLoading={loading}>
                                Go
                            </Button>
                        </Box>
                        
                        {loading ? (
                            <Chatloading />
                        ) : (
                            <>
                                {searchResult?.length > 0 ? (
                                    <Box>
                                        {searchResult.map((user) => (
                                            <Box
                                                key={user._id}
                                                display="flex"
                                                alignItems="center"
                                                p={3}
                                                mb={2}
                                                borderRadius="lg"
                                                bg="gray.100"
                                                cursor="pointer"
                                                _hover={{ bg: "gray.200" }}
                                                onClick={() => {
                                                    accessChat(user._id);
                                                    onClose();
                                                }}
                                            >
                                                {user.pic ? (
                                                    <Box
                                                        width="40px"
                                                        height="40px"
                                                        borderRadius="full"
                                                        overflow="hidden"
                                                        mr={3}
                                                        bg="gray.200"
                                                    >
                                                        <img 
                                                            src={user.pic} 
                                                            alt={user.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Box
                                                        width="40px"
                                                        height="40px"
                                                        borderRadius="full"
                                                        bg="blue.500"
                                                        color="white"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        fontSize="lg"
                                                        fontWeight="bold"
                                                        mr={3}
                                                    >
                                                        {user.name[0].toUpperCase()}
                                                    </Box>
                                                )}
                                                <Box>
                                                    <Text fontWeight="bold">{user.name}</Text>
                                                    <Text fontSize="sm" color="gray.600">{user.email}</Text>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    searchResult?.length === 0 && search ? (
                                        <Text color="gray.500" textAlign="center" mt={4}>
                                            No users found
                                        </Text>
                                    ) : (
                                        <Text color="gray.500">Search for users to start a chat</Text>
                                    )
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            )}
        </>
    );
};


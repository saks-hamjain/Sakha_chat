import { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [selectedChat, setSelectedChat] = useState();
    const [Chats, setChats] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        console.log("ChatProvider - userInfo from localStorage:", userInfo);
        setUser(userInfo);
    }, []);

    // Function to manually refresh user from localStorage
    const refreshUser = () => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        console.log("ChatProvider - refreshing user:", userInfo);
        setUser(userInfo);
    };

    return (
        <ChatContext.Provider value={{
            user,
            setUser,
            refreshUser,
            selectedChat,
            setSelectedChat,
            Chats,
            setChats,
            notifications,
            setNotifications
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    return useContext(ChatContext);
};

export default ChatProvider;

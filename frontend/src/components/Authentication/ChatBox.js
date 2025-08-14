import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useChat } from '../../context/ChatProvider'; 
import SingleChat from '../SingleChat';

const ChatBox = ({ fetchAgain, setFetchAgain }) => {

  const { selectedChat } = useChat();

  return (
    <Box
      width={{ base: "100%", md: "68%" }}
      bg="rgba(255, 255, 255, 0.9)"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      p={3}
      minHeight="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      backdropFilter="blur(10px)"
    >  
       <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  )
}

export default ChatBox;
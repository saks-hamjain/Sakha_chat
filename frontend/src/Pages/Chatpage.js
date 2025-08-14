import { useChat } from '../context/ChatProvider';
import { Box, Text, Button } from '@chakra-ui/react';
import { SideDrawer } from '../components/Authentication/miscellaneous/SideDrawer';
import MyChats from '../components/Authentication/MyChats';
import ChatBox from '../components/Authentication/ChatBox';
import { useEffect, useState } from 'react';

const Chatpage = () => {
 const { user } = useChat();
 const [fetchAgain, setFetchAgain] = useState(false);
 
 
 return ( 
 <Box 
   width="100%" 
   minHeight="100vh" 
   backgroundImage="url('../background.jpg')"
   backgroundSize="cover"
   backgroundPosition="center"
   backgroundRepeat="no-repeat"
 >
   {user ? (
     <>
       <SideDrawer />
       <Box
         display='flex'
         justifyContent='space-between'
         width='100%'
         height='91.5vh'
         padding='10px'
         gap='10px'>
        <MyChats fetchAgain={fetchAgain}  setFetchAgain={setFetchAgain} />
        <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
       </Box>
     </>
   ) : (
     <Box 
       display="flex" 
       alignItems="center" 
       justifyContent="center" 
       height="100vh"
       flexDirection="column"
     >
       <Text fontSize="xl" color="red.500">
         No user found. Please log in first.
       </Text>
       <Button 
         mt={4} 
         colorScheme="blue" 
         onClick={() => window.location.href = '/'}
       >
         Go to Login
       </Button>
     </Box>
   )}
  </Box>
    );
};

export default Chatpage;
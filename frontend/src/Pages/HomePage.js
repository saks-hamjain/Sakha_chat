import { 
  Container, 
  Box, 
  Text,
  Tabs
} from '@chakra-ui/react'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Login from '../components/Authentication/Login';
import Signup from '../components/Authentication/Signup';

const HomePage = () => {

  const Navigate = useNavigate();
  
  // Clear localStorage on HomePage load to force showing login/signup
  useEffect(() => {
    localStorage.removeItem("userInfo");
  }, []);
  
  // Temporarily commented out auto-redirect for testing
  // useEffect(() => {
  //   const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //   if (userInfo) {
  //     Navigate('/chats');
  //   }
  // }, [Navigate]);
  

  return (
    <Container maxW='xl' centerContent>
      <Box
        display='flex'
        justifyContent='center'
        p={3}
        bg='white'
        w='100%'
        m='40px 0 15px 0'
        borderRadius='lg'
        borderWidth='1px'
        boxShadow='lg'>
        <Text fontSize='4xl' fontFamily='Work Sans' color='black' fontWeight='bold'>
          Sakha Chat
        </Text>
      </Box>
      <Box bg='white' w='100%' p={4} borderRadius='lg' borderWidth='1px' boxShadow='lg'>
        <Tabs.Root variant="enclosed" defaultValue="Login">
          <Tabs.List>
            <Tabs.Trigger value="Login">Login</Tabs.Trigger>
            <Tabs.Trigger value="Signup">Signup</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="Login">
            <Login />
          </Tabs.Content>
          <Tabs.Content value="Signup">
            <Signup />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Container>
  )
};

export default HomePage;
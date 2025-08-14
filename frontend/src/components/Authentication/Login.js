import React, { useState } from 'react'
import { 
  VStack, 
  Box, 
  Text, 
  Input, 
  Button,
  Stack
} from '@chakra-ui/react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatProvider';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useChat();

  const handleClick = () => setShow(!show);
 
  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      alert('Please fill all the fields');
      setLoading(false);
      return;
    }

    try{
      const config ={
        headers:{
          'Content-Type':'application/json',
        }
      };

      const { data } = await axios.post('api/user/login',{ email, password }, config);
      console.log("Login response data:", data);
      alert('Login Successful');
      localStorage.setItem('userInfo',JSON.stringify(data));
      console.log("User data saved to localStorage:", JSON.stringify(data));
      setUser(data); // Update context immediately
      setLoading(false);
      navigate('/chats');
    }
    catch (error){
      alert('Error: Failed to login');
       setLoading(false);
    } };

  return (
    <VStack spacing='5px'>
      <Box width='100%'>
        <Text mb='8px' fontWeight='bold'>Email *</Text>
        <Input
          type='email'
          placeholder='Enter Your Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Box>
      
      <Box width='100%'>
        <Text mb='8px' fontWeight='bold'>Password *</Text>
        <Stack direction='row'>
          <Input
            type={show ? 'text' : 'password'}
            placeholder='Enter Your Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button size='sm' onClick={handleClick} minW='60px'>
            {show ? 'Hide' : 'Show'}
          </Button>
        </Stack>
      </Box>

      <Button
        width='100%'
        colorScheme='blue'
        style={{ marginTop: 15 }}
        loading={loading}
        onClick={submitHandler}
      >
        Login
      </Button>
      <Button
        width='100%'  
        variant='solid'
        colorScheme='red'
        onClick={() => {
          setEmail('guest@example.com');
          setPassword('123456');
        }}
        >Get Guest user credential</Button>
    </VStack>
  );
}

export default Login
import { 
  VStack, 
  Box, 
  Text, 
  Input, 
  Button,
  Stack
} from '@chakra-ui/react'
import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'      

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pic, setPic] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // React Router v6 navigation

  const handleClick = () => setShow(!show);

  const PostDetails = (pic) => {
    setLoading(true);
    if (pic === undefined) {
      alert('Please select an image!');
      setLoading(false);
      return;
    }
    
    if (pic.type === 'image/jpeg' || pic.type === 'image/png') {
      const data = new FormData();
      data.append('file', pic);
      data.append('upload_preset', 'sakha-chat');
      data.append('cloud_name', 'dez9xlhkn');
      
      fetch('https://api.cloudinary.com/v1_1/dez9xlhkn/image/upload', {
        method: 'post',
        body: data,
      })
      .then((res) => res.json())
      .then((data) => {
        setPic(data.url.toString());
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
    } else {
      alert('Please select an image!');
      setLoading(false);
      return;
    }
  };

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill all the fields');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      setLoading(false);
      return;
    } 
    
    try {
      const config =  {
        headers: {
          'Content-type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/user',
        {
          name,
          email,
          password,
          ...(pic && { pic }), // Only include pic if it has a value
        },
        config
      );      console.log(data);
      alert('Registration Successful');
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      navigate('/chats');
    } catch (error) {
      alert('Error: Registration failed');
      setLoading(false);
    }
  };

  return (
    <VStack spacing='5px'>
      <Box width='100%'>
        <Text mb='8px' fontWeight='bold'>Name *</Text>
        <Input
          placeholder='Enter Your Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Box>

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

      <Box width='100%'>
        <Text mb='8px' fontWeight='bold'>Confirm Password *</Text>
        <Stack direction='row'>
          <Input
            type={show ? 'text' : 'password'}
            placeholder='Confirm Your Password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button size='sm' onClick={handleClick} minW='60px'>
            {show ? 'Hide' : 'Show'}
          </Button>
        </Stack>
      </Box>

      <Box width='100%'>
        <Text mb='8px' fontWeight='bold'>Upload Your Picture</Text>
        <Input
          type='file'
          p={1.5}
          accept='image/*'
          onChange={(e) => PostDetails(e.target.files[0])}
        />
      </Box>

      <Button
        colorScheme='blue'
        width='100%'
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        disabled={loading}
      >
        {loading ? 'Signing Up...' : 'Sign Up'}
      </Button>
    </VStack>
  )
}

export default Signup
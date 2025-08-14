import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ChatProvider from './context/ChatProvider';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChatProvider >
    <BrowserRouter>
    <ChakraProvider value={defaultSystem}>
       <App />
    </ChakraProvider>
   </BrowserRouter>
  </ChatProvider>
);

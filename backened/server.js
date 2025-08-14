const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { chats } = require('./data.js'); // Importing chats from data.js
const connectDB = require('./config/db.js'); // Importing database connection function
const userRoutes = require('./routes/userRoutes.js'); // Importing user routes
const chatRoutes = require('./routes/chatRoutes.js'); // Importing chat routes
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js'); // Importing error handling middleware
const messageRoutes = require('./routes/messageRoutes.js'); // Importing message routes

dotenv.config({ path: path.join(__dirname, '../.env') }); // Load environment variables from root .env file

connectDB(); // Connect to the database

const app = express();

// Middleware to parse requests
app.use(express.json()); // Middleware to parse JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded requests

// CORS middleware (if needed)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

const PORT = process.env.PORT || 5000;

app.get('/',(req,res)=> {
    res.send('...................API Is running successfully............');
});

app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);

app.use(notFound)
app.use(errorHandler); // Middleware for error handling

const server = app.listen(PORT,()=>{console.log(`Server is running on port ${PORT}`);})

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type',
        'Authorization'],
        credentials: true,
    }
});

io.on('connection', (socket) => {
    console.log('Connected to socket.io');

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('User joined room: ' + room);
    });

    socket.on('new message', (newMessageReceived) => {
        const chat = newMessageReceived.chat;

        if (!chat.users) return console.log('chat.users not defined');

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit('message received', newMessageReceived);
        });
    });

    socket.off('setup', () => {
        console.log('USER DISCONNECTED');
        socket.leave(userData._id);
    });
});

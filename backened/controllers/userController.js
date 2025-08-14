const asyncHandler = require("express-async-handler");
const User = require('../models/userModel.js'); // Importing User model
const generateToken = require('../config/generateToken.js');

const registerUser = asyncHandler(async (req,res) => {
    const { name, email, password, pic} = req.body;
    if(!name || !email || !password) {
        res.status(400);
        throw new Error('Please Enter all the fields');
    }

    const userExists = await User.findOne({ email});
    if(userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    console.log('Creating user with email:', email);
    const user = await User.create({
        name,
        email,
        password,
        ...(pic && { pic }), // Only include pic if it's provided
    });
    console.log('User created successfully:', email);

    if(user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id), 
        });

    } else {
        res.status(400);
        throw new Error('Failed to create the user');
    }
});

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: password ? '[PROVIDED]' : '[MISSING]' });

    // Let's also check all users for debugging
    const allUsersCount = await User.countDocuments();
    console.log('Total users in database:', allUsersCount);

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
        console.log('User details:', { id: user._id, name: user.name, email: user.email });
        const isMatch = await user.matchPassword(password);
        console.log('Password match:', isMatch);
        
        if (isMatch) {
            console.log('Login successful for:', email);
            res.json({
                _id : user._id,
                name: user.name,    
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id), 
            });
        } else {
            console.log('Password mismatch for:', email);
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } else {
        console.log('User not found:', email);
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
$or:[
     {name: {$regex: req.query.search, $options: 'i'}},
     {email: {$regex: req.query.search, $options: 'i'}}
]
    }
     : {};
     
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }); // Exclude the logged-in user
    res.send(users);
});
    

module.exports = { registerUser, authUser, allUsers };


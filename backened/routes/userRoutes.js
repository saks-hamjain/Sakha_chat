const express = require('express');
const { registerUser, authUser, allUsers } = require('../controllers/userController.js'); // Importing user controller functions
const { protect } = require('../middleware/authMiddleware.js'); // Importing protect middleware
const router = express.Router();

router.route('/').post(registerUser).get(protect, allUsers);

router.post('/login',authUser)

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');
const { sendMessage, allMessages } = require('../controllers/messageController.js');



router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages); 

module.exports = router;
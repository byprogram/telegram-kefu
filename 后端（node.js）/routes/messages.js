const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware,requireRole,upload } = require('../middleware/authMiddleware');

router.post('/send',authMiddleware,requireRole(['staff', 'manager']),upload.single('file'), messageController.sendMessage);
router.get('/:id', messageController.getMessageDetail);

module.exports = router;

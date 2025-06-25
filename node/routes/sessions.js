const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

const { authMiddleware,requireRole } = require('../middleware/authMiddleware');


router.get('/', authMiddleware,requireRole(['staff', 'manager']), sessionController.list);
router.get('/:id/messages', sessionController.getMessages);
router.post('/:id/close', sessionController.closeSession);

module.exports = router;

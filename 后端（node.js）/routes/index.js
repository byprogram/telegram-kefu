const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/sessions', require('./sessions'));
router.use('/messages', require('./messages'));
router.use('/staffs', require('./staffs'));


router.use('/quick_replies', require('./quickReplies'));
router.use('/routing', require('./routing'));
router.use('/languages', require('./languages'));

module.exports = router;

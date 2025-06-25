const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/', staffController.list);
router.get('/:id', staffController.detail);
router.put('/:id', staffController.updateStatus);

router.get('/auth-code/generate', staffController.generateAuthCode); // 生成校验码
router.get('/auth-code/check', staffController.checkAuthCode);       // 校验是否登录成功
module.exports = router;

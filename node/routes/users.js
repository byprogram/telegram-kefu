const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // 假设你有这个控制器
// 下面才能写路由
router.get('/', userController.list);
router.get('/:id', userController.detail);
router.put('/:id', userController.updateRemark);

module.exports = router;

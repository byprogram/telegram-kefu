const pool = require('../db/pool');
const multer = require('multer');
const path = require('path');

// 鉴权中间件
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 1, message: '缺少或非法的 Authorization 头' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const [rows] = await pool.query('SELECT * FROM staffs WHERE token = ?', [token]);
    if (rows.length === 0) {
      return res.status(401).json({ code: 1, message: '无效的 token' });
    }

    req.staff = rows[0]; // 保存客服信息，包括 role
    next();
  } catch (error) {
    console.error('Token 校验失败:', error);
    return res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

// 权限校验中间件
const requireRole = (roles) => (req, res, next) => {
  if (!req.staff || !roles.includes(req.staff.roles)) {
    return res.status(403).json({ code: 1, message: '无权限访问' });
  }
  next();
};

// 配置上传目录和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/');  // 文件保存目录
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // .png
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-'); // image
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${baseName}-${uniqueSuffix}${ext}`; // image-171123456789.png
    console.log('保存文件名:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,  // 允许最大文件50MB
    fieldSize: 20 * 1024 * 1024, // 允许最大字段20MB
  }
});

module.exports = {
  authMiddleware,
  requireRole,
  upload,
};
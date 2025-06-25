const pool = require('../db/pool');
const { telegram } = require('../config');

// 获取所有客服人员列表，支持状态和语言筛选
const list = async (req, res) => {
  try {
    const { status, language } = req.query;

    let sql = 'SELECT * FROM staffs WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (language) {
      sql += ' AND language_code = ?';
      params.push(language);
    }

    const [rows] = await pool.query(sql, params);

    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    console.error('获取客服列表失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

// 获取客服详细信息
const detail = async (req, res) => {
  try {
    const staffId = req.params.id;
    const [rows] = await pool.query('SELECT * FROM staffs WHERE id = ?', [staffId]);

    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '客服不存在' });
    }

    res.json({ code: 0, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('获取客服详情失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

// 修改客服状态（在线/离线）
const updateStatus = async (req, res) => {
  try {
    const staffId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ code: 1, message: '状态不能为空' });
    }

    await pool.query('UPDATE staffs SET status = ? WHERE id = ?', [status, staffId]);

    res.json({ code: 0, message: '状态更新成功' });
  } catch (error) {
    console.error('更新客服状态失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

const crypto = require('crypto');

// 临时存储校验码到telegram_id映射，可替换为Redis
const pendingAuthMap = new Map();

// 生成随机字符串
function generateRandomCode(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// 客服点击登录，生成校验码
const generateAuthCode = async (req, res) => {
  const code = generateRandomCode(32); // 短一点方便使用
  pendingAuthMap.set(code, null); // 初始状态：未验证

  res.json({ code: 0, message: 'success', data: { authCode: code,botUsername: telegram.botUsername} });
};

const checkAuthCode = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.json({ code: 1, message: '缺少 token' });
  }

  try {
    const [rows] = await pool.query('SELECT id, telegram_id,roles FROM staffs WHERE token = ?', [token]);

    if (rows.length === 0) {
      return res.json({ code: 1, message: '无效 token，未登录' });
    }

    const { telegram_id: telegramId } = rows[0];
    return res.json({ code: 0, message: '登录成功', data: { telegramId, token } });

  } catch (error) {
    console.error('校验登录失败:', error);
    return res.status(500).json({ code: 1, message: '服务器错误' });
  }
};


module.exports = {
  list,
  detail,
  updateStatus,
  generateAuthCode,
  checkAuthCode,
  pendingAuthMap,
};

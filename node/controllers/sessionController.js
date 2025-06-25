const pool = require('../db/pool');
const emojiUnicode = require('emoji-unicode');

// 获取客服会话列表，支持分页和状态筛选
const { telegram } = require('../config');

const list = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const staffId = req.staff.id;  // 从中间件认证传来的当前客服ID

let sql = `
  SELECT 
    s.*, 
    u.nickname, 
    u.username, 
    u.avatar_base64,
    (
      SELECT m.content
      FROM messages m
      WHERE m.session_id = s.id
      ORDER BY m.sent_at DESC
      LIMIT 1
    ) AS last_message
  FROM sessions s
  LEFT JOIN users u ON s.user_id = u.id
  WHERE s.staff_id = ? AND s.status = 1
  ORDER BY s.updated_at DESC
  LIMIT ? OFFSET ?
`;

    const params = [staffId, Number(pageSize), (Number(page) - 1) * Number(pageSize)];

    const [rows] = await pool.query(sql, params);

    const data = rows.map(row => ({
      ...row,
      nickname: extractEmojiCodePoints(row.nickname),
      last_message: extractEmojiCodePoints(row.last_message),
      avatar_base64: row.avatar_base64,
    }));

    res.json({
      code: 0,
      message: 'success',
      data,
    });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};


const getFileUrl = (fileId) => {
  const token = require('../config').telegram.token;
  return `https://api.telegram.org/file/bot${token}/${fileId}`;
};

function convertEmojiToUnicode(str) {
  return Array.from(str).map(char => {
    const code = char.codePointAt(0);
    // 判断是否 emoji（基本过滤，U+1F000 ~ U+1FFFF 常用 emoji）
    if (code >= 0x1F000 && code <= 0x1FFFF) {
      return `:${code.toString(16)}:`;  // 包裹起来
    }
    return char;
  }).join('');
}
function extractEmojiCodePoints(str) {
  if (!str) {
    return ""
  }
  return str.replace(/:([0-9a-f]{4,6}):/gi, (_, hex) => {
    try {
      return String.fromCodePoint(parseInt(hex, 16));
    } catch {
      return _;
    }
  });
}

const getMessages = async (req, res) => {
  try {
    const session_id = req.params.id;

    // 先通过 session_id 查出 user_id
    const [[sessionRow]] = await pool.query(
      `SELECT user_id FROM sessions WHERE id = ?`,
      [session_id]
    );

    if (!sessionRow) {
      return res.status(404).json({ code: 1, message: '会话不存在' });
    }

    const userId = sessionRow.user_id;

    // 再查出该 user_id 的所有消息
    const [rows] = await pool.query(
      `SELECT id, session_id, sender_type, content, message_type,
              DATE_FORMAT(sent_at, '%Y-%m-%d %H:%i:%s') as sent_at
       FROM messages
       WHERE user_id = ?
       ORDER BY sent_at ASC`,
      [userId]
    );

    const messages = rows.map((msg) => {
      return {
          ...msg,
          file_url: getFileUrl(msg.content),
          content: extractEmojiCodePoints(msg.content)
        };
    });

    res.json({
      code: 0,
      message: 'success',
      data: messages,
    });
  } catch (error) {
    console.error('获取用户消息失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};


// 结束会话
const closeSession = async (req, res) => {
  try {
    const sessionId = req.params.id;

    await pool.query('UPDATE sessions SET status = ? WHERE id = ?', ['closed', sessionId]);

    res.json({
      code: 0,
      message: '会话已结束',
    });
  } catch (error) {
    console.error('结束会话失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

module.exports = {
  list,
  getMessages,
  closeSession,
  extractEmojiCodePoints,
  convertEmojiToUnicode,
};

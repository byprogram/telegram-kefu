const TelegramBot = require('node-telegram-bot-api');
const pool = require('../db/pool');
const { telegram } = require('../config');
const axios = require('axios');
const path = require('path');
const { pendingAuthMap } = require('../controllers/staffController');
const emojiUnicode = require('emoji-unicode');
const {sendMessageToClient,clients} = require('../ws/index'); // 确保路径正确
const {extractEmojiCodePoints,convertEmojiToUnicode} = require("../controllers/sessionController")

const bot = new TelegramBot(telegram.token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const username = msg.from.username || '';
  const firstName = msg.from.first_name || '';
  const safeUsername = convertEmojiToUnicode(firstName);
  const lang = msg.from.language_code || '';
  let message_type = "unknown";
  let file_url = "";
  let content = "";
  
try {
  if (msg.text) {
    message_type = 'text';
    content = convertEmojiToUnicode(msg.text);

    if (msg.text.startsWith('/start ')) {
      const authCode = msg.text.split(' ')[1];
      const telegramId = msg.from.id;

      console.log('[收到登录校验]', authCode, '当前待验证Map:', pendingAuthMap);

      if (pendingAuthMap.has(authCode)) {
        await pool.query('UPDATE staffs SET token = ?, updated_at = NOW() WHERE telegram_id = ?', [authCode, telegramId]);
        pendingAuthMap.delete(authCode);
        bot.sendMessage(msg.chat.id, '✅ 登录成功！您现在可以使用客服系统了。');
        return;
      } else {
        bot.sendMessage(msg.chat.id, '❌ 无效或过期的登录码，请重新尝试登录。');
        return;
      }
    }

  } else if (msg.photo) {
    message_type = 'photo';
    const largestPhoto = msg.photo[msg.photo.length - 1];
    const file = await bot.getFile(largestPhoto.file_id);
    file_url = `https://api.telegram.org/file/bot${telegram.token}/${file.file_path}`;

  } else if (msg.voice) {
    message_type = 'voice';
    const file = await bot.getFile(msg.voice.file_id);
    file_url = `https://api.telegram.org/file/bot${telegram.token}/${file.file_path}`;

  } else if (msg.video) {
    message_type = 'video';
    const file = await bot.getFile(msg.video.file_id);
    content = file.file_path;
    file_url = `https://api.telegram.org/file/bot${telegram.token}/${file.file_path}`;

  } else if (msg.document) {
    message_type = 'document';
    const file = await bot.getFile(msg.document.file_id);
    content = file.file_path;
    file_url = `https://api.telegram.org/file/bot${telegram.token}/${file.file_path}`;

  } else if (msg.sticker) {
    message_type = 'sticker';
    const file = await bot.getFile(msg.sticker.file_id);
    content = file.file_path;
    file_url = `https://api.telegram.org/file/bot${telegram.token}/${file.file_path}`;

  } else if (msg.location) {
    message_type = 'location';
    content = `lat: ${msg.location.latitude}, lon: ${msg.location.longitude}`;

  } else if (msg.contact) {
    message_type = 'contact';
    content = `name: ${msg.contact.first_name}, phone: ${msg.contact.phone_number}`;
  }

} catch (error) {
  console.error('处理消息出错：', error);

  // 先发送一条说明消息
  await bot.sendMessage(telegram.adminGroupId, `❌ 出现 getFile 错误：${error.message}\n即将转发出错消息，请管理员查看`);

  // 然后转发原始消息
  await bot.forwardMessage(telegram.adminGroupId, msg.chat.id, msg.message_id);
    message_type = 'text';
    content = `❌消息获取失败，请查看群消息`;
}

  try {
    // 获取头像并转 base64
    let avatarBase64 = null;
    try {
      const profilePhotos = await bot.getUserProfilePhotos(telegramId, { limit: 1 });

      if (profilePhotos.total_count > 0) {
        const photoArray = profilePhotos.photos[0];
        const fileId = photoArray[photoArray.length - 1].file_id;

        const file = await bot.getFile(fileId);
        const filePath = file.file_path;
        const fileUrl = `https://api.telegram.org/file/bot${telegram.token}/${filePath}`;

        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const mimeType = getMimeTypeFromPath(filePath);
        avatarBase64 = `data:${mimeType};base64,${Buffer.from(response.data).toString('base64')}`;

      }
    } catch (avatarErr) {
      console.warn('获取头像失败：', avatarErr.message);
    }

    // 先分配在线客服
    const onlineStaffs = await getOnlineStaffs();

    if (onlineStaffs.length === 0) {
      // 无在线客服，自动回复
      await bot.sendMessage(chatId, '您好，目前所有客服均不在线，请稍后再试，感谢您的理解！');
      return;
    }

    const assignedStaff = pickStaffByWeight(onlineStaffs);
    if (!assignedStaff) {
      // 理论上不会进这里，因为已经检查了onlineStaffs长度
      await bot.sendMessage(chatId, '抱歉，暂时无法分配客服，请稍后再试。');
      return;
    }

    // 获取或创建用户
    let [userRows] = await pool.query('SELECT id FROM users WHERE telegram_id = ?', [telegramId]);
    let userId;

    if (userRows.length > 0) {
      userId = userRows[0].id;
      await pool.query(
        `UPDATE users SET nickname = ?, username = ?, language_code = ?, avatar_base64 = ?, last_active_at = NOW() WHERE telegram_id = ?`,
        [safeUsername, username, lang, avatarBase64, telegramId]
      );
    } else {
      const [result] = await pool.query(
        `INSERT INTO users (telegram_id, nickname, username, language_code, avatar_base64, created_at, last_active_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [telegramId, safeUsername, username, lang, avatarBase64]
      );
      userId = result.insertId;
    }

    // 获取或创建会话
    let [sessionRows] = await pool.query(
      'SELECT id FROM sessions WHERE user_id = ? AND status = 1 LIMIT 1',
      [userId]
    );

    let sessionId;
    if (sessionRows.length > 0) {
      sessionId = sessionRows[0].id;
        await pool.query(
          `UPDATE sessions SET updated_at = NOW() WHERE id = ?`,
          [sessionId]
        );
    } else {
      const [sessionResult] = await pool.query(
        `INSERT INTO sessions (user_id, status, staff_id, created_at, updated_at)
         VALUES (?, 1, ?, NOW(), NOW())`,
        [userId,assignedStaff.id]
      );
      sessionId = sessionResult.insertId;
    }

    // 插入消息
    await pool.query(
      `INSERT INTO messages (session_id, user_id, sender_type, content, staff_id, message_type, sent_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [sessionId, userId, 0, content, assignedStaff.id, message_type]
    );
let [sessionRows_new] = await pool.query(
  `SELECT s.*, u.nickname, u.avatar_base64, u.username, m.content AS last_message
   FROM sessions s
   JOIN users u ON s.user_id = u.id
   LEFT JOIN (
     SELECT m1.session_id, m1.content
     FROM messages m1
     JOIN (
       SELECT session_id, MAX(sent_at) AS max_sent_at
       FROM messages
       WHERE sender_type = 0
       GROUP BY session_id
     ) m2 ON m1.session_id = m2.session_id AND m1.sent_at = m2.max_sent_at
   ) m ON s.id = m.session_id
   WHERE s.staff_id = ? AND s.status = 1
   ORDER BY s.updated_at DESC`,
  [assignedStaff.id]
);

    const data = sessionRows_new.map(row => ({
      ...row,
      nickname: extractEmojiCodePoints(row.nickname),
      last_message: extractEmojiCodePoints(row.last_message),
    }));

      sendMessageToClient(assignedStaff.id,{message_type,content,sessionId,sessionRows_new:data,file_url}); 
  } catch (error) {
    console.error('处理消息失败：', error);
  }
});



function pickStaffByWeight(staffs) {
  if (!staffs.length) return null;

  const totalWeight = staffs.reduce((sum, s) => sum + s.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const staff of staffs) {
    if (rand < staff.weight) {
      return staff;
    }
    rand -= staff.weight;
  }
  return null;
}

// 获取 MIME 类型
function getMimeTypeFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

async function getOnlineStaffs() {
  const [rows] = await pool.query('SELECT id, weight FROM staffs WHERE status = 1');
  return rows;
}


module.exports = bot;

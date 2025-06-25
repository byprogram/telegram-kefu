const pool = require('../db/pool');
const bot = require('../bot');
const fs = require('fs');
const path = require('path');
const {convertEmojiToUnicode} =  require("../controllers/sessionController");

const sendMessage = async (req, res) => {

  try {
    const { session_id, content, type } = req.body;
    const file = req.file; // multer处理后的文件对象
    console.log(type,session_id,file)

    if (!session_id || !type) {
      return res.status(400).json({ code: 1, message: '参数不完整' });
    }

    const [[row]] = await pool.query(`
      SELECT u.telegram_id, u.id as user_id
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [session_id]);

    if (!row || !row.telegram_id) {
      return res.status(404).json({ code: 1, message: '未找到对应用户' });
    }

    const { telegram_id, user_id } = row;
    const staffId = req.staff?.id || null;
    const now = new Date();

    let messageContent = type === 'text' ? content : (file ? file.filename : content || '');
    let filePath = null; // 记录保存路径（图片、视频等）

    switch (type) {
      case 'text':
        await bot.sendMessage(telegram_id, content);
        break;

      case 'photo': {
        if (!file) {
          filePath = await saveBase64Image(messageContent);
        }else{
          filePath = `${file.path}`
        }
        await bot.sendPhoto(telegram_id, fs.createReadStream(filePath))        
        .then(async res=>{
            const file =await bot.getFile(res.photo[0].file_id);
             messageContent = file.file_path;
          });
        break;
      }

      case 'video': {
        if (!file) {
          filePath = await saveBase64Video(messageContent);
        }else{
          filePath = `${file.path}`
        }
        console.log(filePath)
        await bot.sendVideo(telegram_id, fs.createReadStream(filePath)) 
        .then(async res=>{
            const file =await bot.getFile(res.video.file_id);
             messageContent = file.file_path;
          });
        break;
      }

      case 'sticker':
        await bot.sendSticker(telegram_id, content);
        break;

      case 'voice':
        if (file) {
          const stream = fs.createReadStream(path.resolve(file.path));
          await bot.sendVoice(telegram_id, stream);
          fs.unlink(file.path, () => {});
          messageContent = file.filename;
        } else {
          await bot.sendVoice(telegram_id, content);
        }
        break;

      case 'document':
        if (file) {
          const stream = fs.createReadStream(path.resolve(file.path));
          await bot.sendDocument(telegram_id, stream);
          fs.unlink(file.path, () => {});
          messageContent = file.filename;
        } else {
          await bot.sendDocument(telegram_id, content);
        }
        break;

      default:
        return res.status(400).json({ code: 1, message: '不支持的消息类型' });
    }
    // 插入消息记录
    await pool.query(`
      INSERT INTO messages (session_id, user_id, staff_id, sender_type, content, message_type, sent_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      session_id,
      user_id,
      staffId,
      1,
      convertEmojiToUnicode(messageContent),
      type,
      now,
      now,
      now
    ]);

    await pool.query(`UPDATE sessions SET updated_at = NOW() WHERE id = ?`, [session_id]);

    // 统一返回成功和路径信息（如果有）
    res.json({ code: 0, message: '消息发送成功', filePath });

  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};


// 获取单条消息详情
const getMessageDetail = async (req, res) => {
  try {
    const messageId = req.params.id;

    const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [messageId]);

    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '消息不存在' });
    }

    res.json({ code: 0, message: 'success', data: rows[0] });
  } catch (error) {
    console.error('获取消息详情失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

async function saveBase64Image(base64String) {
  // 解析 base64
  const matches = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) throw new Error('base64格式不正确');

  const ext = matches[1].split('/')[1]; // 例如 png、jpeg
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');

  // 生成保存路径，建议项目里专门建个 tmp 目录
  const filename = `image_${Date.now()}.${ext}`;
  const filepath = path.join(__dirname, '../tmp', filename);

  // 保存文件
  await fs.promises.writeFile(filepath, buffer);
  return filepath;
}

async function saveBase64Video(base64String) {
  const matches = base64String.match(/^data:(video\/\w+);base64,(.+)$/);
  if (!matches) throw new Error('视频base64格式不正确');

  const ext = matches[1].split('/')[1]; // mp4 或其他格式
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');

  const filename = `video_${Date.now()}.${ext}`;
  const filepath = path.join(__dirname, '../tmp', filename);

  await fs.promises.writeFile(filepath, buffer);
  return filepath;
}

module.exports = {
  sendMessage,
  getMessageDetail,
};

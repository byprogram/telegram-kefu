const pool = require('../db/pool');

// 获取快捷回复列表
const list = async (req, res) => {
  try {
    const { page = 1, pageSize = 10,message_type } = req.query;

    let sql = 'SELECT * FROM quick_replies WHERE message_type = ?';
    const [rows] = await pool.query(sql, [message_type]);

    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    console.error('快捷回复获取失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

// 添加快捷回复
const add = async (req, res) => {
  try {
    const { content, language, tags } = req.body;

    await pool.query(
      'INSERT INTO quick_replies (content, language, tags, created_at) VALUES (?, ?, ?, NOW())',
      [content, language, tags]
    );

    res.json({ code: 0, message: '添加成功' });
  } catch (error) {
    console.error('添加快捷回复失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

// 修改快捷回复
const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { content, language, tags } = req.body;

    await pool.query(
      'UPDATE quick_replies SET content = ?, language = ?, tags = ? WHERE id = ?',
      [content, language, tags, id]
    );

    res.json({ code: 0, message: '修改成功' });
  } catch (error) {
    console.error('修改快捷回复失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

// 删除快捷回复
const remove = async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query('DELETE FROM quick_replies WHERE id = ?', [id]);

    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    console.error('删除快捷回复失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

module.exports = { list, add, update, remove };

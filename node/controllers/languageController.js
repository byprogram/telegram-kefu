const pool = require('../db/pool');

const list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM languages');
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    console.error('获取语言失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

const add = async (req, res) => {
  try {
    const { code, name } = req.body;
    await pool.query('INSERT INTO languages (code, name, created_at) VALUES (?, ?, NOW())', [code, name]);
    res.json({ code: 0, message: '添加成功' });
  } catch (error) {
    console.error('添加语言失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

const remove = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM languages WHERE id = ?', [id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    console.error('删除语言失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

module.exports = { list, add, remove };

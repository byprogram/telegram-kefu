const pool = require('../db/pool');

const list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM routing_rules ORDER BY priority DESC');
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    console.error('获取分流规则失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

const add = async (req, res) => {
  try {
    const { language, staff_id, priority } = req.body;
    await pool.query(
      'INSERT INTO routing_rules (language, staff_id, priority, created_at) VALUES (?, ?, ?, NOW())',
      [language, staff_id, priority]
    );
    res.json({ code: 0, message: '添加成功' });
  } catch (error) {
    console.error('添加分流规则失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { language, staff_id, priority } = req.body;
    await pool.query(
      'UPDATE routing_rules SET language = ?, staff_id = ?, priority = ? WHERE id = ?',
      [language, staff_id, priority, id]
    );
    res.json({ code: 0, message: '修改成功' });
  } catch (error) {
    console.error('修改规则失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

const remove = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM routing_rules WHERE id = ?', [id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    console.error('删除规则失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

module.exports = { list, add, update, remove };

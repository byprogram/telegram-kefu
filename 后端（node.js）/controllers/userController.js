const pool = require('../db/pool');

const list = async (req, res) => {
    console.log(1)
  try {
    // 获取查询参数，支持分页和筛选
    const { page = 1, pageSize = 10, language, status } = req.query;

    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (language) {
      sql += ' AND language_code = ?';
      params.push(language);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));

    const [rows] = await pool.query(sql, params);

    res.json({
      code: 0,
      message: 'success',
      data: rows,
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

const detail = async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '用户不存在' });
    }

    res.json({
      code: 0,
      message: 'success',
      data: rows[0],
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

const updateRemark = async (req, res) => {
  try {
    const userId = req.params.id;
    const { remark, tags } = req.body;

    // 这里tags可以是字符串或者数组，取决于你的设计
    await pool.query('UPDATE users SET remark = ?, tags = ? WHERE id = ?', [remark, tags, userId]);

    res.json({
      code: 0,
      message: '更新成功',
    });
  } catch (error) {
    console.error('更新用户备注错误:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

module.exports = {
  list,
  detail,
  updateRemark,
};

const express = require('express');
const router = express.Router();
const pool = require('../db');


// ✅ Check DB connection (async-safe for mysql2 promise pool)
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ DB connection is alive.');
  } catch (error) {
    console.error('❌ DB connection issue:', error.message);
  }
})();

// ➕ Add a new tasksheet entry
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      project_id,
      task_category_id,
      entry_date,
      hours,
      minutes,
      
      description,
      task_name
    } = req.body;

     const h = Number(hours) || 0;
const m = Number(minutes) || 0;
const totalHours = h + m / 60;
    console.log('📥 Incoming payload:', req.body);

    const [result] = await pool.query(
      `INSERT INTO tasksheet_entries (
        user_id, project_id, task_category_id, entry_date, hours, minutes, total_hours,description, task_name
      ) VALUES (?, ?, ?, ?, ?, ?, ? , ? , ? )`,
      [user_id, project_id, task_category_id, entry_date, hours, minutes, totalHours, description, task_name]
    );

    console.log('🧾 Insert result:', result);

    if (result.affectedRows > 0) {
      res.status(201).json({
        message: '✅ Tasksheet entry added successfully',
        id: result.insertId
      });
    } else {
      res.status(500).json({ error: '❌ Insert failed: No rows affected' });
    }
  } catch (error) {
    console.error('🚨 Error inserting tasksheet entry:', error);
    res.status(500).json({
      error: 'Failed to add tasksheet entry',
      details: error.message
    });
  }
});

// 📂 Fetch entries for a user with optional time filters
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { filter } = req.query;

  let query = `SELECT * FROM tasksheet_entries WHERE user_id = ?`;
  const params = [userId];

  switch (filter) {
    case 'today':
      query += ` AND DATE(entry_date) = CURDATE()`;
      break;
    case 'week':
      query += ` AND YEARWEEK(entry_date, 1) = YEARWEEK(CURDATE(), 1)`;
      break;
    case 'month':
      query += ` AND MONTH(entry_date) = MONTH(CURDATE()) AND YEAR(entry_date) = YEAR(CURDATE())`;
      break;
    case 'last_3_months':
      query += ` AND entry_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`;
      break;
    case 'last_6_months':
      query += ` AND entry_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`;
      break;
  }

  query += ` ORDER BY entry_date DESC`;

  try {
    const [rows] = await pool.query(query, params);

    const mappedRows = rows.map((row) => ({
      ...row,
      task_name: row.task_name || row.name || `Unnamed Task (${row.id})`
    }));

    res.json(mappedRows);
  } catch (error) {
    console.error('🚨 Error fetching entries:', error);
    res.status(500).json({
      error: 'Failed to retrieve entries',
      details: error.message
    });
  }
});

module.exports = router;

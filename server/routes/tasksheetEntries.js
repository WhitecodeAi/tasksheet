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
      
      comments,
      task_name
    } = req.body;

     const h = Number(hours) || 0;
const m = Number(minutes) || 0;
const totalHours = h + m / 60;
    

    const [result] = await pool.query(
      `INSERT INTO tasksheet_entries (
        user_id, project_id, task_category_id, entry_date, hours, minutes, total_hours,comments, task_name
      ) VALUES (?, ?, ?, ?, ?, ?, ? , ? , ? )`,
      [user_id, project_id, task_category_id, entry_date, hours, minutes, totalHours, comments, task_name]
    );

 

    if (result.affectedRows > 0) {
      res.status(201).json({
        message: '✅ Tasksheet entry added successfully',
        id: result.insertId
      });
    } else {
      res.status(500).json({ error: '❌ Insert failed: No rows affected' });
    }
  } catch (error) {
 
    res.status(500).json({
      error: 'Failed to add tasksheet entry',
      details: error.message
    });
  }
});


//   Delete a tasksheet entry by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM tasksheet_entries WHERE id = ?',
      [id]
    );

    if (result.affectedRows > 0) {
      res.json({ message: '✅ Entry deleted successfully' });
    } else {
      res.status(404).json({ error: '❌ Entry not found or already deleted' });
    }
  } catch (error) {
    res.status(500).json({
      error: '❌ Failed to delete entry',
      details: error.message
    });
  }
});

// 📂 Fetch entries for a user with optional time filters
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { filter, date } = req.query;
  let query = `SELECT * FROM tasksheet_entries WHERE user_id = ?`;
  const params = [userId];

  if (date) {
    query += ` AND DATE(entry_date) = ?`;
    params.push(date);
  } else {
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
 
    res.status(500).json({
      error: 'Failed to retrieve entries',
      details: error.message
    });
  }
});

// ✏️ Update an existing tasksheet entry by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    user_id,
    project_id,
    task_category_id,
    entry_date,
    hours,
    minutes,
    comments,
    task_name
  } = req.body;

  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  const totalHours = h + m / 60;

  try {
    const [result] = await pool.query(
      `UPDATE tasksheet_entries SET
        user_id = ?, 
        project_id = ?, 
        task_category_id = ?, 
        entry_date = ?, 
        hours = ?, 
        minutes = ?, 
        total_hours = ?, 
        comments = ?, 
        task_name = ?
      WHERE id = ?`,
      [user_id, project_id, task_category_id, entry_date, hours, minutes, totalHours, comments, task_name, id]
    );

    if (result.affectedRows > 0) {
      res.json({ message: '✅ Entry updated successfully' });
    } else {
      res.status(404).json({ error: '❌ Entry not found or update failed' });
    }
  } catch (error) {
    res.status(500).json({
      error: '❌ Failed to update entry',
      details: error.message
    });
  }
});

// ⏱️ Get total hours per user for a specific date (for TeamTimesheetPanel)
router.get('/team-summary', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Missing date parameter' });

  try {
    const [rows] = await req.db.query(
      `SELECT user_id, SUM(total_hours) AS total_hours
       FROM tasksheet_entries
       WHERE entry_date = ?
       GROUP BY user_id`,
      [date]
    );

    const result = rows.map(row => ({
      user_id: row.user_id,
      totalTime: row.total_hours ? `${parseFloat(row.total_hours).toFixed(2)}h` : '0h'
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ Error fetching team summary:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

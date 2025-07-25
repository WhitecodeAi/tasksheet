const express = require('express');
const router = express.Router();
const pool = require('../db'); // assuming you're using MySQL pool

router.post('/', async (req, res) => {
  try {
    const { user_id, project_id, task_category_id, entry_date, hours, description } = req.body;

    const [result] = await pool.query(
      `INSERT INTO tasksheet_entries (user_id, project_id, task_category_id, entry_date, hours, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, project_id, task_category_id, entry_date, hours, description]
    );

    res.status(201).json({ message: 'Tasksheet entry added', id: result.insertId });
  } catch (error) {
    console.error('Error inserting tasksheet entry:', error);
    res.status(500).json({ error: 'Failed to add tasksheet entry qqq' });
  }
});

module.exports = router;

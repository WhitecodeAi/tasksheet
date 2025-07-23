const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query('SELECT id, name FROM task_categories ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching task categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

// routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../db');  // ✅ pool already uses promises
const bcrypt = require('bcrypt');


// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id AS user_id, name, email, role FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


// Add a new user
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if email already exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a user
router.put('/:id', (req, res) => {
  const { name, email, role } = req.body;
  db.query(
    'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
    [name, email, role, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Update failed' });
      res.json({ message: 'User updated' });
    }
  );
});

// Delete a user
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ message: 'User deleted' });
  });
});

module.exports = router;

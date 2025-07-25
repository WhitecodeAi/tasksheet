// routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  db.query('SELECT id, name, email, role FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch users' });
    res.json(results);
  });
});

// Add a new user
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'User creation failed' });
      res.json({ message: 'User created', userId: result.insertId });
    }
  );
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

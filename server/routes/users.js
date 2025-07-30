// routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../db');  // ✅ pool already uses promises
const bcrypt = require('bcrypt');
const sendEmailToUser = require('../utils/sendEmail'); // ✅ corrected path

// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id AS user_id, name, email, role FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Database error while fetching users.' });
  }
});

// Add a new user
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if email already exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already in use. Please use a different one.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    // Send email to new user
    try {
      await sendEmailToUser({ name, email, password });
      console.log(`✅ Email sent to ${email}`);
    } catch (emailErr) {
      console.error('❌ Failed to send email:', emailErr);
    }

    res.status(201).json({ message: 'User added and email sent successfully.' });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ message: 'Internal server error while adding user.' });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  const { name, email, role } = req.body;
  const userId = req.params.id;

  try {
    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User updated successfully.' });
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ message: 'Error while updating user.' });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found. Cannot delete.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete failed:', err);
    res.status(500).json({ message: 'Error while deleting user.' });
  }
});

module.exports = router;

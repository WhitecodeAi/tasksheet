const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();
const db = require('../db');

// ✅ DEBUG route — must be outside login
router.get('/debug-password', async (req, res) => {
  const input = req.query.password;
  const hash = 'copiedHashFromDB';
  const match = await bcrypt.compare(input, hash);
  res.json({ match });
});

// ✅ LOGIN route
router.post('/login', async (req, res) => {
  console.log("Request body:", req.body);

  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    console.log("DB query result:", rows);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    console.log("Email:", email);
    console.log("Password (incoming):", password);
    console.log("Stored hash:", user.password);

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

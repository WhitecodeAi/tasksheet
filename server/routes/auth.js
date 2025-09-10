const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();
const db = require('../db');
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
  return res.status(400).json({ error: "Email and password are required." });
}

  console.log("Login attempt for:", email);

  const jwtSecret = process.env.JWT_SECRET || 'insecure_dev_secret';
  if (process.env.ADMIN_STATIC_LOGIN_ENABLED === 'true' && email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const user = { id: 0, name: 'Administrator', email, role: 'admin' };
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });
    return res.json({ token, user });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
      expiresIn: '1h',
    });

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const jwtSecret = process.env.JWT_SECRET || 'insecure_dev_secret';
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Token expired or invalid' });
    }
    req.user = user;
    next();
  });
}

module.exports = verifyToken;

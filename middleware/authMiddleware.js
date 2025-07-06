const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(403).json({ error: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    req.user = user; // attach user to request
    next();
  });
};

module.exports = authenticateToken;

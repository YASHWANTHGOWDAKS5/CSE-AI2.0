// routes/profile.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// 🔒 Middleware to authenticate user via JWT
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// 🔵 GET user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// 🟢 PUT: update profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { department, experience, isMentor, profilePicture, subjects } = req.body;

    const updated = await User.findOneAndUpdate(
      { email: req.user.email },
      {
        department,
        experience,
        isMentor,
        profilePicture,
        subjects
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: '✅ Profile updated', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Failed to update profile' });
  }
});

module.exports = router;

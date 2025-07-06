const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// 🟢 Register Route
router.post('/register', async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const name = req.body.name;
  const password = req.body.password;
  const role = req.body.role || 'Faculty'; // optionally pass role during registration

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profilePicture: '',
      department: '',
      experience: '',
      isMentor: false,
      subjects: {},
      lastLogin: new Date()
    });

    await newUser.save();
    res.status(200).json({ message: '✅ User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Server error during registration' });
  }
});

// 🟢 Login Route
router.post('/login', async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: '✅ Login successful',
      token,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Server error during login' });
  }
});
// ✅ GET All Users (Admin Panel)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;

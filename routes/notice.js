// routes/notice.js
const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const User = require('../models/User');

// POST a new notice
router.post('/', async (req, res) => {
  try {
    const { title, author } = req.body;

    const user = await User.findOne({ name: author });
    if (!user) return res.status(404).json({ error: 'Author not found' });

    const newNotice = new Notice({
      title,
      author: user._id,
    });

    await newNotice.save();

    res.json({ message: 'Notice posted successfully' });
  } catch (err) {
    console.error('Error posting notice:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all notices with author name
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().populate('author', 'name').sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    console.error('Error fetching notices:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

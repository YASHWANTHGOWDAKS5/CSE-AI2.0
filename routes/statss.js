// routes/stats.js
const express = require('express');
const router = express.Router();
const EmailLog = require('../models/EmailLog');

// GET all emails
router.get('/emails', async (req, res) => {
  try {
    const logs = await EmailLog.find().sort({ timestamp: -1 });
    res.json({ count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
});

// POST a new email log
router.post('/emails', async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: 'Missing "to" field' });

    await EmailLog.create({ to });
    res.status(201).json({ message: 'Email log saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save email log' });
  }
});

module.exports = router;

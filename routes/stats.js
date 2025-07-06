const express = require('express');
const router = express.Router();

// Replace with actual Mongoose models you're using
const Email = require('../models/Email');     // If you track sent emails
const Alert = require('../models/Alert');     // If you store alerts

// Total sent emails
router.get('/emails', async (req, res) => {
  try {
    const count = await Email.countDocuments(); // Example
    res.json({ totalEmails: count });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching email stats' });
  }
});

// Total alerts
router.get('/alerts', async (req, res) => {
  try {
    const count = await Alert.countDocuments(); // Example
    res.json({ totalAlerts: count });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching alert stats' });
  }
});
// Additional email logging routes
const EmailLog = require('../models/EmailLog'); // New model

// GET: List of emails sent (with timestamp)
router.get('/emails/logs', async (req, res) => {
  try {
    const logs = await EmailLog.find().sort({ timestamp: -1 });
    res.json({ count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
});

// POST: Save a log when an email is sent
router.post('/emails/logs', async (req, res) => {
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

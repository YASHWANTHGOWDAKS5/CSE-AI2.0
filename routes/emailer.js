// ✅ backend/routes/emailer.js
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const emailjs = require('@emailjs/nodejs');

const SERVICE_ID = 'service_fv85jfa';
const TEMPLATE_ID = 'template_vo2piiv';
const PUBLIC_KEY = '7EZW6GocIwZ9WslIk';

const { JWT_SECRET } = process.env;

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// ✅ Get students with attendance < 85%
router.get('/get-low-attendance', authenticateToken, async (req, res) => {
  try {
    const facultyEmail = req.user.email;
    const records = await Attendance.find({ facultyEmail });

    const summary = {};
    records.forEach((rec) => {
      const usn = rec.studentId;
      if (!summary[usn]) {
        summary[usn] = {
          name: rec.studentName,
          usn,
          present: 0,
          total: 0,
          semester: rec.semester,
          subject: rec.subject,
        };
      }
      summary[usn].total++;
      if (rec.status.toLowerCase() === 'present') summary[usn].present++;
    });

    const students = await Student.find({});
    const studentMap = {};
    students.forEach((s) => (studentMap[s.usn] = s.email));

    const lowAttendance = Object.entries(summary)
      .filter(([_, data]) => (data.present / data.total) * 100 < 85)
      .map(([usn, data]) => ({
        ...data,
        percentage: ((data.present / data.total) * 100).toFixed(1),
        email: studentMap[usn] || null,
      }));

    res.json(lowAttendance);
  } catch (err) {
    console.error('❌ Error in GET /get-low-attendance:', err.message);
    res.status(500).json({ error: 'Failed to fetch low attendance data' });
  }
});

// ✅ Send emails to all students with <85%
router.post('/send-low-emails', authenticateToken, async (req, res) => {
  try {
    const facultyEmail = req.user.email;
    const profile = await Profile.findOne({ email: facultyEmail });
    const facultyName = profile?.name || 'CSE-AI Department';

    const attendance = await Attendance.find({ facultyEmail });
    const students = await Student.find({});
    const studentMap = {};
    students.forEach((s) => (studentMap[s.usn] = s.email));

    const summary = {};
    attendance.forEach((rec) => {
      const usn = rec.studentId;
      if (!summary[usn]) {
        summary[usn] = {
          name: rec.studentName,
          usn,
          present: 0,
          total: 0,
          semester: rec.semester,
          subject: rec.subject,
        };
      }
      summary[usn].total++;
      if (rec.status.toLowerCase() === 'present') summary[usn].present++;
    });

    let sentCount = 0;
    const lowAttendanceList = Object.entries(summary)
      .filter(([_, data]) => (data.present / data.total) * 100 < 85)
      .map(([usn, data]) => ({
        ...data,
        percentage: ((data.present / data.total) * 100).toFixed(1),
        email: studentMap[usn] || null,
      }));

    for (const student of lowAttendanceList) {
      if (!student.email) {
        console.log(`❌ Skipping ${student.usn} — no email`);
        continue;
      }

      const templateParams = {
        to_email: student.email,
        to_name: student.name,
        attendance_percentage: student.percentage,
        subject: 'Low Attendance Warning',
        semester: student.semester || 'N/A',
        subject_name: student.subject || 'N/A',
        from_name: facultyName,
      };

      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log(`✅ Sent to ${student.name} (${student.usn})`);
        sentCount++;
      } catch (err) {
        console.error(`❌ Failed for ${student.usn}`, err.message);
      }
    }

    return res.status(200).json({ message: `Emails sent to ${sentCount} students.` });
  } catch (error) {
    console.error('❌ Emailer error:', error);
    return res.status(500).json({ error: 'Failed to send emails' });
  }
});

// ✅ NEW: Send email to a single student (used by AgentChat)
router.post('/send-to-student', authenticateToken, async (req, res) => {
  try {
    const facultyEmail = req.user.email;
    const profile = await Profile.findOne({ email: facultyEmail });
    const facultyName = profile?.name || 'CSE-AI Department';

    const {
      to_email,
      to_name,
      attendance_percentage,
      semester,
      subject_name
    } = req.body;

    if (!to_email || !to_name || !attendance_percentage || !semester || !subject_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const templateParams = {
      to_email,
      to_name,
      attendance_percentage,
      subject: 'Low Attendance Warning',
      semester,
      subject_name,
      from_name: facultyName,
    };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log(`✅ Sent individual email to ${to_name} (${to_email})`);

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('❌ Individual email error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to send individual email' });
  }
});

module.exports = router;

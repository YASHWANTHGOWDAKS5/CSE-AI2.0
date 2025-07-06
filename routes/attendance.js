const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/Profile'); // ensure this is already imported
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_secret';

// 🔐 Middleware for consistent auth
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// ✅ Get students based on profile's subjects (semesters)
router.get('/by-profile-semesters', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user || !user.subjects) {
      return res.status(404).json({ error: 'No subjects found in profile' });
    }

    const semesterKeys = Object.keys(user.subjects).map(Number); // e.g., ['5', '6'] -> [5, 6]
    if (!semesterKeys.length) {
      return res.status(400).json({ error: 'No valid semesters in profile' });
    }

    const students = await Student.find({ semester: { $in: semesterKeys } }).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students from profile semesters:', err);
    res.status(500).json({ error: 'Failed to fetch students based on profile' });
  }
});

// ✅ Get students by semester
router.get('/students', authMiddleware, async (req, res) => {
  try {
    const query = {};

    if (req.query.semester) {
      const semester = parseInt(req.query.semester, 10);
      if (!isNaN(semester)) {
        query.semester = semester;
      }
    }

    const students = await Student.find(query).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ✅ General student fetch
router.get('/', async (req, res) => {
  try {
    const query = {};

    if (req.query.semester) {
      const semester = parseInt(req.query.semester, 10);
      if (!isNaN(semester)) {
        query.semester = semester;
      }
    }

    const students = await Student.find(query).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ✅ Upload attendance
router.post('/upload', authMiddleware, async (req, res) => {
  try {
    const records = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Invalid records payload' });
    }

    const { date, semester, subject } = records[0];
    const attendanceDate = new Date(date);
    const parsedSemester = parseInt(semester, 10);

    if (isNaN(attendanceDate.getTime()) || isNaN(parsedSemester)) {
      return res.status(400).json({ error: 'Invalid date or semester format' });
    }

    const facultyEmail = req.user.email;

    const existing = await Attendance.findOne({
      date: attendanceDate,
      semester: parsedSemester,
      subject,
      facultyEmail
    });

    if (existing) {
      return res.status(409).json({
        error: 'Attendance already exists for this date/subject',
        existingId: existing._id
      });
    }

    const recordsWithMeta = records.map(entry => ({
      ...entry,
      date: attendanceDate,
      semester: parsedSemester,
      facultyEmail
    }));

    const result = await Attendance.insertMany(recordsWithMeta);
    res.status(201).json({
      message: 'Attendance uploaded successfully!',
      count: result.length,
      firstId: result[0]?._id
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload attendance' });
  }
});

// ✅ Update attendance (Delete + Reinsert)
// ✅ Update attendance (Patch existing records)
router.patch('/update/:id', authMiddleware, async (req, res) => {
  try {
    const records = req.body;
    const facultyEmail = req.user.email;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Invalid update records' });
    }

    const { date, semester, subject } = records[0];
    const parsedDate = new Date(date);
    const parsedSemester = parseInt(semester, 10);

    if (isNaN(parsedDate.getTime()) || isNaN(parsedSemester)) {
      return res.status(400).json({ error: 'Invalid date or semester format' });
    }

    let updatedCount = 0;

    for (const entry of records) {
      const result = await Attendance.findOneAndUpdate(
        {
          date: parsedDate,
          semester: parsedSemester,
          subject,
          facultyEmail,
          studentId: entry.studentId
        },
        {
          $set: { status: entry.status }
        },
        { new: true }
      );
      if (result) updatedCount++;
    }

    res.json({
      message: 'Attendance updated successfully!',
      count: updatedCount
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});


// ✅ Get attendance by faculty
router.get('/by-faculty', authMiddleware, async (req, res) => {
  try {
    const { email } = req.user;
    const { semester, date } = req.query;
    const query = { facultyEmail: email };

    if (semester) query.semester = parseInt(semester, 10);
    if (date) query.date = new Date(date);

    const records = await Attendance.find(query)
      .sort({ date: -1, semester: 1 })
      .limit(100);

    res.json(records);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

module.exports = router;

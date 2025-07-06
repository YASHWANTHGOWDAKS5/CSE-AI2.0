const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// 🔁 GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
router.get('/', async (req, res) => {
  try {
    const query = {};

    if (req.query.semester) {
      const semester = parseInt(req.query.semester, 10); // ✅ use parseInt
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
// ✅ POST a single student
router.post('/', async (req, res) => {
  const {
    name, usn, branch, semester, email, studentPhone,
    fatherName, fatherPhone, motherName, motherPhone,
    parentEmail, dob, gender, address, guardianOccupation
  } = req.body;

  if (!name || !usn || !branch || !semester || !email) {
    return res.status(400).json({ error: 'Name, USN, Branch, Semester, and Email are required.' });
  }

  try {
    const newStudent = new Student({
      name, usn, branch, semester, email, studentPhone,
      fatherName, fatherPhone, motherName, motherPhone,
      parentEmail, dob, gender, address, guardianOccupation
    });

    await newStudent.save();
    res.json({ message: 'Student added successfully' });
  } catch (err) {
    console.error('Error saving student:', err);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// 📥 BULK CSV UPLOAD
router.post('/bulk', async (req, res) => {
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Invalid students format' });
    }

    const toInsert = [];

    for (const s of students) {
      if (!s.name || !s.usn || !s.branch || !s.semester || !s.email) continue;

      const exists = await Student.findOne({ usn: s.usn });
      if (!exists) toInsert.push(s);
    }

    const saved = await Student.insertMany(toInsert);
    res.json({ message: 'Students added', count: saved.length });
  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ error: 'Failed to upload students' });
  }
});

// ✏️ EDIT
router.put('/:usn', async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { usn: req.params.usn },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student updated', student: updated });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// 🗑️ DELETE
router.delete('/:usn', async (req, res) => {
  try {
    const removed = await Student.findOneAndDelete({ usn: req.params.usn });
    if (!removed) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;

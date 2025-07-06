// backend/models/Attendance.js
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentName: String,
  studentId: String,
  subject: String,
  semester: Number,
  date: { type: Date, default: Date.now },
  facultyEmail: String,
  imageUrl: String,
  status: String // Present / Absent
});

module.exports = mongoose.model('Attendance', AttendanceSchema);

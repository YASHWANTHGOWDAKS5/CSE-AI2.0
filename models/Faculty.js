
// ✅ FILE 4: backend/models/Faculty.js
const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  department: String,
  experience: Number,
  isMentor: Boolean,
  subjects: Object,
  profilePicture: String,
  lastLogin: Date,
  role: { type: String, default: 'Faculty' },
});

module.exports = mongoose.model('Faculty', FacultySchema);
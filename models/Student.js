const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  semester: { type: Number, required: true },
  email: { type: String, required: true },
  studentPhone: { type: String }, // 📱 NEW FIELD

  fatherName: String,
  fatherPhone: String,
  motherName: String,
  motherPhone: String,
  parentEmail: String,
  dob: String,
  gender: String,
  address: String,
  guardianOccupation: String,
});

module.exports = mongoose.model('Student', studentSchema);

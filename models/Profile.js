const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  subjects: { type: Object, default: {} },
  department: String,
  experience: String,
  isMentor: Boolean,
  profilePicture: String, // Profile photo
  coverImage: String      // Cover image
});

module.exports = mongoose.model('Profile', profileSchema);

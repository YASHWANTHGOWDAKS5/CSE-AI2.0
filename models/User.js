// ✅ FILE: backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // 🔐 Auth Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // 📄 Profile Fields
  role: { type: String, default: 'Faculty' },
  department: { type: String, default: '' },
  experience: { type: Number, default: 0 },
  isMentor: { type: Boolean, default: false },
  subjects: { type: Object, default: {} },

  // 🖼️ Images
  profilePicture: { type: String, default: '' },
  coverImage: { type: String, default: '' },

  // 📆 Metadata
  lastLogin: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

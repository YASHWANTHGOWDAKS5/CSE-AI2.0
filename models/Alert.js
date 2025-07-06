const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  message: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);

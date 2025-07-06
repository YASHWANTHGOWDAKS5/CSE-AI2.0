const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
  to: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailLog', EmailLogSchema);

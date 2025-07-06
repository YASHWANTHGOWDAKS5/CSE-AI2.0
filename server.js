const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Import routes
const agentRoutes = require('./routes/agent');
const authRoutes = require('./routes/auth');
const noticeRoutes = require('./routes/notice');
const statsRoutes = require('./routes/stats');
const studentRoutes = require('./routes/student');
const profileRoutes = require('./routes/profile');
const uploadRoutes = require('./routes/upload');
const attendanceRoutes = require('./routes/attendance'); // Add this at top
const emailRoutes = require('./routes/emailer');
app.use('/api/emails', emailRoutes);
const extractEntitiesRoute = require('./routes/extract-entities');
app.use('/api', extractEntitiesRoute); //
app.use('/api/attendance', attendanceRoutes); // Add this in middlewares

// ✅ Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// ✅ Use API routes
app.use('/api/dates', require('./routes/dates'));

app.use('/api/agent', agentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

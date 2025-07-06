// routes/dates.js
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance'); // adjust model path

router.get('/unique-dates', async (req, res) => {
  try {
    const dates = await Attendance.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          }
        }
      },
      {
        $sort: { _id: -1 } // latest first
      }
    ]);

    res.json(dates.map(d => d._id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dates' });
  }
});

module.exports = router;

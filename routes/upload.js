const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const streamifier = require('streamifier');
const cloudinary = require('../cloudinary');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Use in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔐 Middleware to verify token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// 📤 POST /api/upload/upload-image
router.post('/upload-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { type } = req.body;

    if (!req.file || !['profilePicture', 'coverImage'].includes(type)) {
      return res.status(400).json({ error: 'Invalid image or type' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 🔁 Delete old image from Cloudinary if it exists and is from Cloudinary
    const existingUrl = user[type];
    if (existingUrl && existingUrl.includes('res.cloudinary.com')) {
      const publicId = existingUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(err => {
        console.warn('⚠️ Could not delete previous image from Cloudinary:', err.message);
      });
    }

    // 📤 Upload new image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const newImageUrl = result.secure_url;

    // 📝 Update MongoDB
    user[type] = newImageUrl;
    await user.save();

    res.status(200).json({
      message: '✅ Image uploaded & saved successfully',
      imageUrl: newImageUrl,
      type,
      profilePicture: user.profilePicture,
      coverImage: user.coverImage,
    });

  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: '❌ Image upload failed' });
  }
});

module.exports = router;

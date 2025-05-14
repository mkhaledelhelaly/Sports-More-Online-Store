const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const { verifyToken } = require('../routes/verifyToken');
const User = require('../models/User');

const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

// Multer setup (in memory, not saving to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.put('/profile', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { username, email, password, address, phoneNumber } = req.body; // Include phoneNumber

    if (!username && !email && !password && !address && !phoneNumber && !req.file) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    const profileFields = {};
    if (username) profileFields.username = username;
    if (email) profileFields.email = email;
    if (address) profileFields.address = address;
    if (phoneNumber) profileFields.phoneNumber = phoneNumber; // Add phoneNumber to profileFields

    if (password) {
      profileFields.password = await bcrypt.hash(password, saltRounds);
    }

    // If an image was uploaded, convert it to base64
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      profileFields.profilePicture = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

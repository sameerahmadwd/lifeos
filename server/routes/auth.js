const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret', {
    expiresIn: '30d',
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      user.lastLogin = Date.now();
      await user.save();
      
      await Activity.create({
        user: user._id,
        type: 'login',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        avatarColor: user.avatarColor,
        lastLogin: user.lastLogin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      user.lastLogin = Date.now();
      await user.save();

      await Activity.create({
        user: user._id,
        type: 'login',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        avatarColor: user.avatarColor,
        lastLogin: user.lastLogin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Logout activity tracking
router.post('/logout', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.lastLogout = Date.now();
      await user.save();

      await Activity.create({
        user: user._id,
        type: 'logout',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

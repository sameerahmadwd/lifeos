const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const Note = require('../models/Note');
const Habit = require('../models/Habit');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// GET /api/profile — fetch current user profile + stats
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const [taskCount, noteCount, habitCount] = await Promise.all([
      Task.countDocuments({ user: req.user.id }),
      Note.countDocuments({ user: req.user.id }),
      Habit.countDocuments({ user: req.user.id }),
    ]);
    const completedTasks = await Task.countDocuments({ user: req.user.id, completed: true });
    
    // Fetch last 10 activities
    const activities = await Activity.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      ...user.toObject(),
      activityLog: activities,
      stats: {
        tasks: taskCount,
        completedTasks,
        notes: noteCount,
        habits: habitCount,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/profile — update profile fields
router.put('/', protect, async (req, res) => {
  try {
    const { name, bio, phone, jobTitle, timezone, avatarColor } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, phone, jobTitle, timezone, avatarColor },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/profile/password — change password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save(); // triggers bcrypt hash via pre-save hook
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

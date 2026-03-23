const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: 1 });
    res.json(habits);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const habit = new Habit({ user: req.user.id, name: req.body.name });
    await habit.save();
    res.json(habit);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name: req.body.name },
      { new: true }
    );
    res.json(habit);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    await HabitLog.deleteMany({ habitId: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted cleanly from core dependencies arrays.' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;

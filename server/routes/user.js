const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const DailyLog = require('../models/DailyLog');
const { protect } = require('../middleware/authMiddleware');

// Get all custom habits for the user
router.get('/habits', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: 1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a new customized colored habit
router.post('/habits', protect, async (req, res) => {
  try {
    const { name, color } = req.body;
    const habit = new Habit({ user: req.user.id, name, color: color || '#6366f1' });
    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Edit & Patch pre-existing habit data explicitly syncing to daily logs
router.put('/habits/:id', protect, async (req, res) => {
  try {
    const { name, color } = req.body;
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, color },
      { new: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    
    // Crucial: Cascade modifications synchronously updating localized historical daily log parameters universally
    await DailyLog.updateMany(
      { user: req.user.id, "habits.habitId": req.params.id },
      { $set: { "habits.$[elem].name": name, "habits.$[elem].color": color } },
      { arrayFilters: [{ "elem.habitId": req.params.id }] }
    );

    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Permanently delete a targeted habit stripping it accurately off prior logs
router.delete('/habits/:id', protect, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    
    // Purge the element explicitly destroying blank dashboard parameters
    await DailyLog.updateMany(
      { user: req.user.id },
      { $pull: { habits: { habitId: req.params.id } } }
    );
    
    res.json({ message: 'Habit securely removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

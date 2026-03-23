const express = require('express');
const router = express.Router();
const DailyLog = require('../models/DailyLog');
const Habit = require('../models/Habit');
const { protect } = require('../middleware/authMiddleware');

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// Fetch or auto-create day's log merging live habit logic
router.get('/:date', protect, async (req, res) => {
  try {
    const { date } = req.params;
    let log = await DailyLog.findOne({ user: req.user.id, date });
    const existingHabits = await Habit.find({ user: req.user.id }).sort({ createdAt: 1 });

    if (!log) {
      const mappedHabits = existingHabits.map(h => ({
        habitId: h._id,
        name: h.name,
        color: h.color || '#6366f1',
        completed: false
      }));

      log = new DailyLog({
        user: req.user.id,
        date,
        tasks: [],
        habits: mappedHabits,
        focusTime: 0,
        notes: ''
      });
      await log.save();
    } else {
      // Vital mechanism: If they pulled today's log, seamlessly merge recently created global habits onto it
      if (date === getTodayDateStr()) {
        const logHabitIds = log.habits.map(h => h.habitId ? h.habitId.toString() : '');
        let modified = false;

        existingHabits.forEach(h => {
          if (!logHabitIds.includes(h._id.toString())) {
            log.habits.push({
              habitId: h._id,
              name: h.name,
              color: h.color || '#6366f1',
              completed: false
            });
            modified = true;
          }
        });
        
        if (modified) {
          await log.save();
        }
      }
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update day's log automatically
router.put('/:date', protect, async (req, res) => {
  try {
    const { date } = req.params;
    const { tasks, habits, focusTime, notes } = req.body;

    let log = await DailyLog.findOne({ user: req.user.id, date });

    if (!log) {
      log = new DailyLog({ user: req.user.id, date });
    }

    if (tasks !== undefined) log.tasks = tasks;
    if (habits !== undefined) log.habits = habits;
    if (focusTime !== undefined) log.focusTime = focusTime;
    if (notes !== undefined) log.notes = notes;

    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Analytics: fetch entire month for active calendar tracker mapping
router.get('/month/:month', protect, async (req, res) => {
  try {
    const { month } = req.params; // Expected format: YYYY-MM
    const logs = await DailyLog.find({
      user: req.user.id,
      date: { $regex: `^${month}` }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

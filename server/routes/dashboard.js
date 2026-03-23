const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const Task = require('../models/Task');
const FocusSession = require('../models/FocusSession');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

// Central Aggregator: Merge 5 discrete tables into unified frontend array.
router.get('/:date', protect, async (req, res) => {
  try {
    const { date } = req.params;
    
    // 1. Resolve custom habits mapping their historical state logic accurately
    const habitsList = await Habit.find({ user: req.user.id });
    const currentHabitLogs = await HabitLog.find({ user: req.user.id, date });
    
    // Dynamic integration seamlessly bridging completion identifiers
    const habits = habitsList.map(h => {
      const log = currentHabitLogs.find(l => l.habitId.toString() === h._id.toString());
      return {
        _id: h._id,
        name: h.name,
        completed: log ? log.completed : false
      };
    });

    // 2. Map isolated sub-modules linearly
    const tasks = await Task.find({ user: req.user.id, date });
    const focus = await FocusSession.findOne({ user: req.user.id, date });
    const note = await Note.findOne({ user: req.user.id, date });

    res.json({
      tasks: tasks.map(t => ({ id: t._id, text: t.text, completed: t.completed })),
      habits,
      focusTime: focus ? focus.duration : 0,
      notes: note ? note.content : ''
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', details: error.message });
  }
});

// Distribution Subprocessor: Maps incoming generic payloads structurally destroying conflicts reliably.
router.put('/:date', protect, async (req, res) => {
  try {
    const { date } = req.params;
    const { tasks, habits, focusTime, notes } = req.body;

    // 1. Task wipe-and-replace pipeline ensuring total 1:1 sync limits flawlessly
    if (tasks !== undefined) {
      await Task.deleteMany({ user: req.user.id, date });
      if (tasks.length > 0) {
        const tasksToInsert = tasks.map(t => ({
          user: req.user.id,
          date,
          text: t.text,
          completed: t.completed
        }));
        await Task.insertMany(tasksToInsert);
      }
    }

    // 2. Upsert generic configurations mapped securely to arrays universally out overlapping safely
    if (habits !== undefined) {
      for (let h of habits) {
        await HabitLog.findOneAndUpdate(
          { user: req.user.id, date, habitId: h._id },
          { completed: h.completed },
          { upsert: true, new: true }
        );
      }
    }

    if (focusTime !== undefined) {
      await FocusSession.findOneAndUpdate(
        { user: req.user.id, date },
        { duration: focusTime },
        { upsert: true, new: true }
      );
    }

    if (notes !== undefined) {
      await Note.findOneAndUpdate(
        { user: req.user.id, date },
        { content: notes },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Dashboard Granular Tables Synced" });
  } catch(e) {
    res.status(500).json({ message: 'Server Error', details: e.message });
  }
});

// Analytics Route: Gather discrete logs intelligently safely accurately cleanly parsing deep populated names
router.get('/month/:month', protect, async (req, res) => {
  try {
    const { month } = req.params;
    
    const logs = await HabitLog.find({
      user: req.user.id,
      date: { $regex: `^${month}` }
    }).populate('habitId', 'name');
    
    const daysObj = {};
    logs.forEach(log => {
      if(!daysObj[log.date]) {
        daysObj[log.date] = { date: log.date, completedCount: 0, completedHabits: [] };
      }
      if(log.completed) {
        daysObj[log.date].completedCount++;
        if (log.habitId) {
          daysObj[log.date].completedHabits.push(log.habitId.name);
        }
      }
    });
    
    const allHabitsCount = await Habit.countDocuments({ user: req.user.id });
    
    const formattedArray = Object.values(daysObj).map(d => ({
      ...d,
      totalCount: allHabitsCount
    }));

    res.json(formattedArray);
  } catch(e) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

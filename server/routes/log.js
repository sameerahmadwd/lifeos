const express = require('express');
const router = express.Router();
const DailyLog = require('../models/DailyLog');
const Habit = require('../models/Habit');
const notificationService = require('../services/notificationService');
const { protect } = require('../middleware/authMiddleware');

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const calculateStreak = async (userId, habitId) => {
    let streak = 0;
    let currDate = new Date();
    
    // Check back for up to 365 days to avoid infinite loops
    for (let i = 0; i < 365; i++) {
        const dateStr = currDate.toISOString().split('T')[0];
        const log = await DailyLog.findOne({ user: userId, date: dateStr });
        const habitLog = log?.habits.find(h => h.habitId && h.habitId.toString() === habitId.toString());
        
        if (habitLog?.completed) {
            streak++;
            currDate.setDate(currDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
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
    const oldHabits = log ? JSON.parse(JSON.stringify(log.habits)) : [];

    if (!log) {
      log = new DailyLog({ user: req.user.id, date });
    }

    if (tasks !== undefined) log.tasks = tasks;
    if (habits !== undefined) log.habits = habits;
    if (focusTime !== undefined) log.focusTime = focusTime;
    if (notes !== undefined) log.notes = notes;

    await log.save();

    // Notification Logic: Streak Alerts & Milestone Achievements
    if (date === getTodayDateStr() && habits) {
        for (const h of habits) {
            const oldH = oldHabits.find(oh => oh.habitId && oh.habitId.toString() === h.habitId.toString());
            // Only trigger if just marked as completed
            if (h.completed && (!oldH || !oldH.completed)) {
                const streak = await calculateStreak(req.user.id, h.habitId);
                // Milestone targets: 3, 7, 14, 30, 60, 90, 100, 365
                const milestones = [3, 7, 14, 30, 60, 90, 100, 365];
                if (milestones.includes(streak)) {
                    await notificationService.createNotification(req.user.id, {
                        type: 'habit',
                        priority: 'high',
                        title: 'Streak Milestone!',
                        message: `Boom! You've hit a ${streak}-day streak for "${h.name}". Keep it up!`,
                        actionUrl: '/habits'
                    });
                }
            }
        }
    }

    res.json(log);
  } catch (error) {
    console.error('Update Log Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Analytics: fetch entire month for active calendar tracker mapping
router.get('/month/:month', protect, async (req, res) => {
  try {
    const { month } = req.params; 
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

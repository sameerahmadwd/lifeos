const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const ProgressLog = require('../models/ProgressLog');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/goals
// @desc    Create a new goal with auto-milestones
router.post('/', protect, async (req, res) => {
  try {
    const { title, targetValue, unit, startValue, deadline, category, numberOfLevels, levelLabels } = req.body;
    
    // Auto-generate default milestones: 5%, 10%, 25%, 50%, 75%, 100%
    const defaultMilestones = [
      { value: Math.round(targetValue * 0.05), label: 'Starting Strong (5%)' },
      { value: Math.round(targetValue * 0.10), label: 'Building Momentum (10%)' },
      { value: Math.round(targetValue * 0.25), label: 'Quarter Way (25%)' },
      { value: Math.round(targetValue * 0.50), label: 'Halfway Point (50%)' },
      { value: Math.round(targetValue * 0.75), label: 'The Home Stretch (75%)' },
      { value: targetValue, label: 'Ultimate Victory (100%)' }
    ];

    const goal = new Goal({
      user: req.user.id,
      title,
      targetValue,
      unit: unit || 'units',
      startValue: startValue || 0,
      currentValue: startValue || 0,
      deadline,
      category: category || 'General',
      milestones: defaultMilestones,
      levelConfig: {
        numberOfLevels: numberOfLevels || 5,
        levelLabels: levelLabels || (numberOfLevels === 10 ? 
          ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8', 'Level 9', 'Level 10'] : 
          ['Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master'])
      }
    });

    // Mark milestones already reached by startValue
    goal.milestones.forEach(m => {
        if (goal.currentValue >= m.value) m.isCompleted = true;
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/goals
// @desc    Get all goals for user
router.get('/', protect, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/goals/:id
// @desc    Get goal details and logs
router.get('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });

    const logs = await ProgressLog.find({ goal: req.params.id }).sort({ createdAt: -1 });
    res.json({ goal, logs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/goals/:id/progress
// @desc    Add progress entry and update goal status
router.post('/:id/progress', protect, async (req, res) => {
  try {
    const { value, note } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });

    const log = new ProgressLog({
      goal: goal._id,
      user: req.user.id,
      value: Number(value),
      note
    });

    await log.save();

    // Update goal progress
    goal.currentValue += Number(value);

    // Check milestones
    goal.milestones.forEach(m => {
      if (goal.currentValue >= m.value) {
        m.isCompleted = true;
      }
    });

    await goal.save();
    res.json({ log, goal });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/goals/:id
// @desc    Update goal details
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, targetValue, unit, deadline, category, numberOfLevels, levelLabels } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });

    if (title) goal.title = title;
    if (unit) goal.unit = unit;
    if (category) goal.category = category;
    if (deadline !== undefined) goal.deadline = deadline;
    
    if (targetValue && targetValue !== goal.targetValue) {
      goal.targetValue = targetValue;
      // Recalculate milestones based on new target
      goal.milestones = [
        { value: Math.round(targetValue * 0.05), label: 'Starting Strong (5%)' },
        { value: Math.round(targetValue * 0.10), label: 'Building Momentum (10%)' },
        { value: Math.round(targetValue * 0.25), label: 'Quarter Way (25%)' },
        { value: Math.round(targetValue * 0.50), label: 'Halfway Point (50%)' },
        { value: Math.round(targetValue * 0.75), label: 'The Home Stretch (75%)' },
        { value: targetValue, label: 'Ultimate Victory (100%)' }
      ];
    }

    if (numberOfLevels || levelLabels) {
      if (numberOfLevels) goal.levelConfig.numberOfLevels = numberOfLevels;
      if (levelLabels) goal.levelConfig.levelLabels = levelLabels;
    }

    // Refresh milestone completion status
    goal.milestones.forEach(m => {
      if (goal.currentValue >= m.value) m.isCompleted = true;
      else m.isCompleted = false;
    });

    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/goals/:id/progress/:logId
// @desc    Update a progress log and recalibrate goal
router.put('/:id/progress/:logId', protect, async (req, res) => {
  try {
    const { value, note } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });

    const log = await ProgressLog.findOne({ _id: req.params.logId, goal: req.params.id });
    if (!log) return res.status(404).json({ msg: 'Log not found' });

    if (value !== undefined) log.value = Number(value);
    if (note !== undefined) log.note = note;
    await log.save();

    // Recalculate goal total from all logs
    const allLogs = await ProgressLog.find({ goal: goal._id });
    const totalProgress = allLogs.reduce((acc, l) => acc + l.value, 0);
    goal.currentValue = goal.startValue + totalProgress;

    // Refresh milestones
    goal.milestones.forEach(m => {
      if (goal.currentValue >= m.value) m.isCompleted = true;
      else m.isCompleted = false;
    });

    await goal.save();
    res.json({ log, goal });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/goals/:id/progress/:logId
// @desc    Delete a progress log and recalibrate goal
router.delete('/:id/progress/:logId', protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });

    const log = await ProgressLog.findOneAndDelete({ _id: req.params.logId, goal: req.params.id });
    if (!log) return res.status(404).json({ msg: 'Log not found' });

    // Recalculate goal total from all remaining logs
    const allLogs = await ProgressLog.find({ goal: goal._id });
    const totalProgress = allLogs.reduce((acc, l) => acc + l.value, 0);
    goal.currentValue = goal.startValue + totalProgress;

    // Refresh milestones
    goal.milestones.forEach(m => {
      if (goal.currentValue >= m.value) m.isCompleted = true;
      else m.isCompleted = false;
    });

    await goal.save();
    res.json({ msg: 'Log deleted', goal });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/goals/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        await ProgressLog.deleteMany({ goal: req.params.id });
        res.json({ msg: 'Goal and logs deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

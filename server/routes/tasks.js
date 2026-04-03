const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const ProgressLog = require('../models/ProgressLog');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ date: -1, createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

router.post('/', protect, async (req, res) => {
  try {
    let { text, date, category, goal, progressValue } = req.body;
    if (!date) {
      const d = new Date();
      date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    const newTask = new Task({
      user: req.user.id,
      text,
      date,
      category: category || 'General',
      completed: false,
      goal,
      progressValue: Number(progressValue) || 0
    });
    await newTask.save();
    res.json(newTask);
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { text, completed, category } = req.body;
    
    let updateFields = {};
    if (text !== undefined) updateFields.text = text;
    if (completed !== undefined) updateFields.completed = completed;
    if (category !== undefined) updateFields.category = category;
    
    const originalTask = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!originalTask) return res.status(404).json({ message: 'Task not found' });

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateFields,
      { new: true }
    );

    // Automation: If task is newly completed and linked to a goal
    if (completed === true && originalTask.completed === false && task.goal && task.progressValue > 0) {
      const goal = await Goal.findById(task.goal);
      if (goal) {
        const log = new ProgressLog({
          goal: goal._id,
          user: req.user.id,
          value: task.progressValue,
          note: `Completed task: ${task.text}`
        });
        await log.save();
        goal.currentValue += task.progressValue;
        // Update milestones
        goal.milestones.forEach(m => {
          if (goal.currentValue >= m.value) m.isCompleted = true;
        });
        await goal.save();
      }
    }
    res.json(task);
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted cleanly natively' });
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

module.exports = router;

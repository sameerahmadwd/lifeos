const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ date: -1, createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

router.post('/', protect, async (req, res) => {
  try {
    console.log('BACKEND: Received body:', req.body);
    let { text, date, category } = req.body;
    if (!date) {
      const d = new Date();
      date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    const newTask = new Task({
      user: req.user.id,
      text,
      date,
      category: category || 'General',
      completed: false
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
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateFields,
      { new: true }
    );
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

const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    // Sort generically strictly newest first successfully natively universally efficiently cleanly accurately sequentially smoothly predictably flawlessly
    const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const newNote = new Note({
      user: req.user.id,
      title: req.body.title || 'New Note',
      content: req.body.content || '',
      date: dateStr
    });
    await newNote.save();
    res.json(newNote);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, content },
      { new: true }
    );
    res.json(note);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted neatly successfully natively cleanly' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Session = require('../models/Session');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/sessions/start
// @desc    Start a new tracking session
router.post('/start', protect, async (req, res) => {
  try {
    const today = req.body.date || new Date().toISOString().split('T')[0];
    
    // Check if there is already an active session for this user today
    let session = await Session.findOne({ userId: req.user.id, status: 'active', date: today });
    
    if (session) {
      return res.json(session);
    }

    session = new Session({
      userId: req.user.id,
      date: today,
      startTime: new Date(),
      lastActiveAt: new Date(),
      status: 'active'
    });

    await session.save();
    res.status(201).json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/sessions/heartbeat
// @desc    Update last active time and duration
router.post('/heartbeat', protect, async (req, res) => {
  try {
    const { date } = req.body;
    // Find session: prefer specified date, but fallback to any active session (handles midnight spans)
    let session;
    if (date) {
      session = await Session.findOne({ userId: req.user.id, status: 'active', date });
    }
    
    if (!session) {
      session = await Session.findOne({ userId: req.user.id, status: 'active' }).sort({ startTime: -1 });
    }

    if (!session) {
      return res.status(404).json({ msg: 'No active session found' });
    }

    const now = new Date();
    // Calculate duration since last update (or start)
    const diffSeconds = Math.floor((now - session.lastActiveAt) / 1000);
    
    // Only increment if the difference is reasonable (e.g., < 60s since last heartbeat)
    // This prevents jumps if the computer was asleep but session stayed 'active'
    if (diffSeconds > 0 && diffSeconds < 60) {
      session.duration += diffSeconds;
    }

    session.lastActiveAt = now;
    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/sessions/stop
// @desc    Close an active session
router.post('/stop', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ userId: req.user.id, status: 'active' });

    if (!session) {
      return res.status(404).json({ msg: 'No active session found' });
    }

    session.status = 'closed';
    session.endTime = new Date();
    
    // Final check for duration
    const finalDiff = Math.floor((session.endTime - session.lastActiveAt) / 1000);
    if (finalDiff > 0 && finalDiff < 60) {
      session.duration += finalDiff;
    }

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sessions/today
// @desc    Get total active time for today
router.get('/today', protect, async (req, res) => {
  try {
    const today = req.query.date || new Date().toISOString().split('T')[0];
    const sessions = await Session.find({ userId: req.user.id, date: today });
    
    const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
    res.json({ totalDuration, sessions });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sessions/history
// @desc    Get session logs for a specific date
router.get('/history', protect, async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    const sessions = await Session.find({ userId: req.user.id, date }).sort({ startTime: 1 });
    
    const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
    res.json({ totalDuration, sessions });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sessions/calendar
// @desc    Get dates with activity for heatmap
router.get('/calendar', protect, async (req, res) => {
  try {
    const stats = await Session.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: "$date", count: { $sum: "$duration" } } }
    ]);
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

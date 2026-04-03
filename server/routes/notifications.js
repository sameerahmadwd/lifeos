const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const NotificationSettings = require('../models/NotificationSettings');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route GET /api/notifications
 * @desc Get all user notifications
 */
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark a notification as read
 */
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route PUT /api/notifications/read-all
 * @desc Mark all notifications as read
 */
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route GET /api/notifications/settings
 * @desc Get user notification settings
 */
router.get('/settings', protect, async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ user: req.user.id });
    if (!settings) settings = await NotificationSettings.create({ user: req.user.id });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route PUT /api/notifications/settings
 * @desc Update user notification settings
 */
router.put('/settings', protect, async (req, res) => {
  try {
    const settings = await NotificationSettings.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

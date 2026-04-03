const Notification = require('../models/Notification');
const NotificationSettings = require('../models/NotificationSettings');
const User = require('../models/User');

/**
 * Smart Notification Service
 */
const notificationService = {
  /**
   * Create a smart notification
   */
  createNotification: async (userId, data) => {
    try {
      const { type, priority, title, message, actionUrl, metadata } = data;

      // 1. Get user settings
      let settings = await NotificationSettings.findOne({ user: userId });
      if (!settings) {
        settings = await NotificationSettings.create({ user: userId });
      }

      // 2. Check if category is enabled
      if (!settings.enabledCategories[type]) {
        return null;
      }

      // 3. Daily Cap Check (max 5 per day)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const dailyCount = await Notification.countDocuments({
        user: userId,
        createdAt: { $gte: startOfDay }
      });

      if (dailyCount >= settings.dailyCap && priority !== 'high') {
        console.log(`Daily cap reached for user ${userId}. Skipping low/medium priority notification.`);
        return null;
      }

      // 4. Duplicate Check (prevent same message in last 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const duplicate = await Notification.findOne({
        user: userId,
        type,
        title,
        createdAt: { $gte: oneDayAgo }
      });

      if (duplicate && priority !== 'high') {
        return null; // Skip duplicate
      }

      // 5. Create Notification
      const notification = new Notification({
        user: userId,
        type,
        priority,
        title,
        message,
        actionUrl,
        metadata
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  /**
   * Bundle multiple pending alerts into one (Conceptual Implementation)
   * This is usually called before high-traffic periods or as a pre-check.
   */
  bundleNotifications: async (userId, notifications) => {
    if (notifications.length <= 1) return notifications;

    // Logic to combine e.g. "2 tasks + 1 habit"
    // For now, we'll just implement the logic to call this from service handlers
    const taskCount = notifications.filter(n => n.type === 'task').length;
    const habitCount = notifications.filter(n => n.type === 'habit').length;

    if (taskCount > 0 && habitCount > 0) {
       return {
         type: 'system',
         priority: 'medium',
         title: 'Daily Update',
         message: `You have ${taskCount} pending tasks and ${habitCount} habits remaining today.`,
         actionUrl: '/dashboard'
       };
    }
    return null;
  }
};

module.exports = notificationService;

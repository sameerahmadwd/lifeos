const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect } = require('../middleware/authMiddleware');

// Helper to get or create global settings
const getGlobalSettings = async () => {
  let settings = await Setting.findOne({ identifier: 'global' });
  if (!settings) {
    settings = await Setting.create({ identifier: 'global' });
  }
  return settings;
};

// GET /api/settings — fetch global website settings
router.get('/', async (req, res) => {
  try {
    const settings = await getGlobalSettings();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/settings — update global website settings (protected)
router.put('/', protect, async (req, res) => {
  try {
    const settings = await getGlobalSettings();

    // 1. General
    if (req.body.appName !== undefined) settings.appName = req.body.appName;
    if (req.body.siteTitle !== undefined) settings.siteTitle = req.body.siteTitle;
    if (req.body.defaultTimezone !== undefined) settings.defaultTimezone = req.body.defaultTimezone;


    // 2. Automation
    if (req.body.autoDeleteInactiveDays !== undefined) settings.autoDeleteInactiveDays = req.body.autoDeleteInactiveDays;
    if (req.body.autoArchiveTasksDays !== undefined) settings.autoArchiveTasksDays = req.body.autoArchiveTasksDays;
    if (req.body.backupFrequency !== undefined) settings.backupFrequency = req.body.backupFrequency;

    // 9. Announcements
    if (req.body.announcement !== undefined) {
      settings.announcement = { ...settings.announcement, ...req.body.announcement };
      // If the message changes, generate a new ID to reset dismissal for everyone
      if (req.body.announcement.message) {
        settings.announcement.id = Math.random().toString(36).substr(2, 9);
      }
    }

    // 10. UI/Brand Control
    if (req.body.logo !== undefined) settings.logo = req.body.logo;
    if (req.body.favicon !== undefined) settings.favicon = req.body.favicon;
    if (req.body.primaryColor !== undefined) settings.primaryColor = req.body.primaryColor;
    
    // 11. Dashboard Control
    if (req.body.dashboardWidgets !== undefined) {
      settings.dashboardWidgets = { ...settings.dashboardWidgets, ...req.body.dashboardWidgets };
    }

    await settings.save();

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

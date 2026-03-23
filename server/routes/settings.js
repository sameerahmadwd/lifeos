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

    if (req.body.theme !== undefined) settings.theme = req.body.theme;
    if (req.body.notifications !== undefined) settings.notifications = req.body.notifications;
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

const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  // We'll use a single document for global settings
  identifier: {
    type: String,
    default: 'global',
    unique: true
  },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  notifications: { type: Boolean, default: true },
  dashboardWidgets: {
    showTasks: { type: Boolean, default: true },
    showHabits: { type: Boolean, default: true },
    showNotes: { type: Boolean, default: true },
    showFocus: { type: Boolean, default: true },
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);

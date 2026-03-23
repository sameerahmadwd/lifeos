const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  // We'll use a single document for global settings
  identifier: { type: String, default: 'global', unique: true },
  
  // 1. General Settings
  appName: { type: String, default: 'LifeOS' },
  siteTitle: { type: String, default: 'LifeOS' },
  defaultTimezone: { type: String, default: 'UTC' },
  maintenanceMode: { type: Boolean, default: false },

  // 2. Automation & Data
  autoDeleteInactiveDays: { type: Number, default: 30 },
  autoArchiveTasksDays: { type: Number, default: 7 },
  backupFrequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },

  // 9. Global Announcements
  announcement: {
    message: { type: String, default: '' },
    enabled: { type: Boolean, default: false },
    id: { type: String, default: () => Math.random().toString(36).substr(2, 9) } // for dismissal logic
  },

  // 10. UI/Brand Control
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  primaryColor: { type: String, default: '#6366f1' },
  defaultTheme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);

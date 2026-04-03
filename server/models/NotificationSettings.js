const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  enabledCategories: {
    tasks: { type: Boolean, default: true },
    habits: { type: Boolean, default: true },
    goals: { type: Boolean, default: true },
    journal: { type: Boolean, default: true },
    engagement: { type: Boolean, default: true },
    system: { type: Boolean, default: true }
  },
  preferredTiming: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    default: 'morning'
  },
  frequencyMode: {
    type: String,
    enum: ['minimal', 'balanced', 'aggressive'],
    default: 'balanced'
  },
  dailyCap: {
    type: Number,
    default: 5
  }
}, { timestamps: true });

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);

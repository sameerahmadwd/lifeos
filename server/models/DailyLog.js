const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  tasks: [{
    id: { type: Number },
    text: { type: String },
    completed: { type: Boolean, default: false }
  }],
  habits: [{
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit' },
    name: { type: String },
    color: { type: String },
    completed: { type: Boolean, default: false }
  }],
  focusTime: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Prevent multiple identically dated logs
dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);

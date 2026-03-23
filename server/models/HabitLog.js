const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

// Strictly prevent massive identical duplication tracking overlaps natively.
schema.index({ user: 1, habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitLog', schema);

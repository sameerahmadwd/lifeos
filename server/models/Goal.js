const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'units'
  },
  startValue: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date
  },
  category: {
    type: String,
    default: 'General'
  },
  milestones: [
    {
      value: { type: Number, required: true },
      label: { type: String, required: true },
      isCompleted: { type: Boolean, default: false }
    }
  ],
  levelConfig: {
    levels: { type: Number, default: 5 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);

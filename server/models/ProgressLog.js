const mongoose = require('mongoose');

const progressLogSchema = new mongoose.Schema({
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  note: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('ProgressLog', progressLogSchema);

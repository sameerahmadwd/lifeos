const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  text: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['General', 'Work', 'Personal', 'Health', 'Finance', 'Urgent'],
    default: 'General'
  },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Task', schema);

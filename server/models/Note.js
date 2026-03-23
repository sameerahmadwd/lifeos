const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Quick Note' },
  content: { type: String, default: '' },
  date: { type: String } // Soft reference to dashboard widget date mapping safely cleanly
}, { timestamps: true });

module.exports = mongoose.model('Note', schema);

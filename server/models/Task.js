// server/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 300 },
  description: { type: String, trim: true, default: '' },
  completed: { type: Boolean, default: false },
  bucket: { type: String, enum: ['today','tomorrow','week'], default: 'today' },
  list: { type: String, default: null },             // <-- optional list name
  startDate: { type: Date },
  expectedCompletion: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);

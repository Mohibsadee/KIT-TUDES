// backend/models/CompletedTask.js
const mongoose = require('mongoose');

const completedTaskSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyTask', required: true },
  userId: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CompletedTask', completedTaskSchema);

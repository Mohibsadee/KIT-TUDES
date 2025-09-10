const mongoose = require('mongoose');

const studyTaskSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['high', 'medium', 'low']
  },
  deadline: Date,
  timeRequired: {
    type: Number,
    required: true,
    min: 15,
    max: 240
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  timeSlot: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudyTask', studyTaskSchema);
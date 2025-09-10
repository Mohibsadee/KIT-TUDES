// models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,  
    min: 15,
    max: 240
  },
  day: {
    type: String,
    required: true,
    enum: ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun']
  },
  instructor: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: 'bg-blue-500'
  },
  userId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);
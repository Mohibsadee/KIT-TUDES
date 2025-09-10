const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['mcq', 'true_false', 'short_answer']
  },
  correctAnswer: {
    type: String,
    required: true
  },
  options: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  timesAnswered: {
    type: Number,
    default: 0
  },
  timesCorrect: {
    type: Number,
    default: 0
  },
  userId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Calculate accuracy percentage (virtual field)
quizQuestionSchema.virtual('accuracy').get(function() {
  if (this.timesAnswered === 0) return 0;
  return (this.timesCorrect / this.timesAnswered) * 100;
});

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
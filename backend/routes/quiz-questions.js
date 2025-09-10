const express = require('express');
const router = express.Router();
const QuizQuestion = require('../models/QuizQuestion');

// Get all quiz questions for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid; // Get user ID from Firebase auth
    
    const questions = await QuizQuestion.find({ userId }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new quiz question
router.post('/', async (req, res) => {
  try {
    const { question, type, correctAnswer, options, difficulty } = req.body;
    const userId = req.user.uid; // Get user ID from Firebase auth
    
    if (!question || !type || !correctAnswer) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate options for MCQ type
    if (type === 'mcq' && (!options || options.length < 2)) {
      return res.status(400).json({ message: 'MCQ questions require at least 2 options' });
    }

    const newQuestion = new QuizQuestion({
      question,
      type,
      correctAnswer,
      options: type === 'mcq' ? options : [],
      difficulty: difficulty || 'easy',
      userId,
      timesAnswered: 0,
      timesCorrect: 0
    });
    
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update quiz question
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const question = await QuizQuestion.findOne({ _id: req.params.id, userId });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Update the question
    Object.assign(question, req.body);
    const updatedQuestion = await question.save();
    
    res.json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update question statistics (when user answers)
router.patch('/:id/answer', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { isCorrect } = req.body;
    const question = await QuizQuestion.findOne({ _id: req.params.id, userId });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.timesAnswered += 1;
    if (isCorrect) {
      question.timesCorrect += 1;
    }

    // Update difficulty based on accuracy
    const accuracy = question.timesCorrect / question.timesAnswered;
    if (accuracy < 0.3) {
      question.difficulty = 'hard';
    } else if (accuracy < 0.7) {
      question.difficulty = 'medium';
    } else {
      question.difficulty = 'easy';
    }

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete quiz question
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const deletedQuestion = await QuizQuestion.findOneAndDelete({ 
      _id: req.params.id, 
      userId 
    });
    
    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
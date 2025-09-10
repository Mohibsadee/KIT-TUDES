// backend/routes/completedTasks.js
const express = require('express');
const router = express.Router();
const CompletedTask = require('../models/CompletedTask');
const { authMiddleware } = require('../middleware/auth');

// Get all completed tasks for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const completedTasks = await CompletedTask.find({ userId }).sort({ completedAt: 1 });
    res.json(completedTasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch completed tasks' });
  }
});

module.exports = router;

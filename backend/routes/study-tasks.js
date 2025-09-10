const express = require('express');
const router = express.Router();
const StudyTask = require('../models/StudyTask');

// Get all study tasks for the logged-in user
router.get('/', async (req, res) => {
  try {
    console.log('Fetching study tasks for user:', req.user.uid);
    const tasks = await StudyTask.find({ userId: req.user.uid });
    console.log('Found study tasks:', tasks.length);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching study tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new study task
router.post('/', async (req, res) => {
  try {
    const { subject, topic, priority, deadline, timeRequired, day, timeSlot, completed } = req.body;
    
    const newTask = new StudyTask({
      subject,
      topic,
      priority,
      deadline,
      timeRequired,
      day,
      timeSlot,
      completed: completed || false,
      userId: req.user.uid
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating study task:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update study task
router.put('/:id', async (req, res) => {
  try {
    const task = await StudyTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Study task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error updating study task:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete study task
router.delete('/:id', async (req, res) => {
  try {
    const task = await StudyTask.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    
    if (!task) {
      return res.status(404).json({ message: 'Study task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting study task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Toggle completion status
router.patch('/:id', async (req, res) => {
  try {
    const task = await StudyTask.findOne({ _id: req.params.id, userId: req.user.uid });
    
    if (!task) {
      return res.status(404).json({ message: 'Study task not found' });
    }
    
    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error toggling study task completion:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
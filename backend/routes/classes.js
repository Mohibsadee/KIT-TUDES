const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const { authMiddleware } = require('../middleware/auth'); // ✅ fix import

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all classes for the logged-in user
router.get('/', async (req, res) => {
  try {
    console.log('Fetching classes for user:', req.user.uid);
    const classes = await Class.find({ userId: req.user.uid });
    console.log('Found classes:', classes.length);
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new class
router.post('/', async (req, res) => {
  try {
    const { subject, time, day, instructor, color, duration } = req.body;
    
    if (!subject || !time || !day || duration === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: subject, time, day, and duration are required' 
      });
    }
    
    const durationNum = typeof duration === 'string' ? parseInt(duration) : duration;
    
    if (isNaN(durationNum)) {
      return res.status(400).json({ message: 'Duration must be a valid number' });
    }
    
    const newClass = new Class({
      subject,
      time,
      day,
      duration: durationNum,
      instructor: instructor || '',
      color: color || 'bg-blue-500',
      userId: req.user.uid, // Always use the authenticated user's ID
    });
    
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a class
router.put('/:id', async (req, res) => {
  try {
    const { subject, time, day, instructor, color, duration } = req.body;
    
    if (!subject || !time || !day || duration === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: subject, time, day, and duration are required' 
      });
    }
    
    const durationNum = typeof duration === 'string' ? parseInt(duration) : duration;
    
    if (isNaN(durationNum)) {
      return res.status(400).json({ message: 'Duration must be a valid number' });
    }
    
    // Find the class and verify it belongs to the user
    const existingClass = await Class.findOne({ _id: req.params.id, userId: req.user.uid });
    
    if (!existingClass) {
      return res.status(404).json({ message: 'Class not found or access denied' });
    }
    
    // Update the class
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      {
        subject,
        time,
        day,
        duration: durationNum,
        instructor: instructor || '',
        color: color || 'bg-blue-500',
      },
      { new: true }
    );
    
    res.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a class
router.delete('/:id', async (req, res) => {
  try {
    // Find the class and verify it belongs to the user
    const existingClass = await Class.findOne({ _id: req.params.id, userId: req.user.uid });
    
    if (!existingClass) {
      return res.status(404).json({ message: 'Class not found or access denied' });
    }
    
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

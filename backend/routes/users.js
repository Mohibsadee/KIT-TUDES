const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user by UID
router.get('/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create or update user
router.post('/', async (req, res) => {
    try {
        const { uid, email, displayName } = req.body; // removed photoURL
        const user = await User.findOneAndUpdate(
            { uid },
            { email, displayName },
            { upsert: true, new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

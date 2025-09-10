const express = require("express");
const StudySession = require("../models/StudySession");

const router = express.Router();

// Save a study session
router.post("/", async (req, res) => {
  try {
    const { duration } = req.body;
    if (!duration || duration <= 0) {
      return res.status(400).json({ error: "Invalid duration" });
    }

    const session = new StudySession({
      userId: req.user.uid, // comes from verifyFirebaseToken middleware
      duration,
    });

    await session.save();
    res.status(201).json(session);
  } catch (err) {
    console.error("Error saving session:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch all sessions for the user
router.get("/", async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user.uid }).sort({
      createdAt: 1,
    });
    res.json(sessions);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Weekly + all-time stats
router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday

    // Weekly stats
    const weekly = await StudySession.aggregate([
      { $match: { userId: req.user.uid, createdAt: { $gte: startOfWeek } } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          total: { $sum: "$duration" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // All-time total
    const allTime = await StudySession.aggregate([
      { $match: { userId: req.user.uid } },
      {
        $group: {
          _id: null,
          total: { $sum: "$duration" },
        },
      },
    ]);

    res.json({
      weekly,
      allTime: allTime.length > 0 ? allTime[0].total : 0,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

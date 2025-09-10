const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Firebase UID
    duration: { type: Number, required: true }, // in seconds
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudySession", studySessionSchema);

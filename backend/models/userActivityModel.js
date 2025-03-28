const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User reference
  startTime: { type: Date, default: null }, // Start time of activity
  endTime: { type: Date, default: null }, // End time of activity
  totalActiveTime: { type: Number, default: 0 }, // Total active time in milliseconds
  createdAt: { type: Date, default: Date.now } // Record creation time
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;

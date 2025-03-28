const UserActivity = require('../models/userActivityModel');
const { getHandlerResponse } = require('../middleware/responseMiddleware');
const httpStatus = require('../Helper/http_status');

// @desc    Start or stop user activity timer
// @route   POST /api/user-activity/toggle
// @access  Private
const toggleUserActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the latest activity record for the user
    let activity = await UserActivity.findOne({ user: userId }).sort({ createdAt: -1 });

    if (!activity || activity.endTime) {
      // If no active record or the last record is already stopped, create a new record
      activity = await UserActivity.create({ user: userId, startTime: new Date() });
      const { code, message, data } = getHandlerResponse(true, httpStatus.CREATED, 'Activity started', activity);
      return res.status(code).json({ code, message, data });
    } else {
      // If an active record exists, stop the timer
      activity.endTime = new Date();
      activity.totalActiveTime += activity.endTime - activity.startTime; // Calculate total active time
      await activity.save();
      const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Activity stopped', activity);
      return res.status(code).json({ code, message, data });
    }
  } catch (error) {
    console.error('❌ User Activity Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

module.exports = {
  toggleUserActivity,
};

const Driver = require('../models/driverModel');

// @desc    Update driver active time
// @route   POST /api/drivers/update-active-time
// @access  Private
const updateDriverActiveTime = async (req, res) => {
  try {
    const { driverId, activeTime } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Update active time only if the driver is idle
    if (driver.status === 'Idle') {
      driver.activeTime += activeTime;
      driver.lastUpdated = new Date();
      await driver.save();
    }

    res.status(200).json({ message: 'Driver active time updated successfully', driver });
  } catch (error) {
    console.error('❌ Update Driver Active Time Error:', error);
    res.status(500).json({ message: 'Failed to update driver active time', error: error.message });
  }
};

module.exports = {
  updateDriverActiveTime,
};

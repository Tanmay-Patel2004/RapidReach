const express = require('express');
const { updateDriverActiveTime } = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/update-active-time', protect, updateDriverActiveTime); // Route to update driver active time

module.exports = router;

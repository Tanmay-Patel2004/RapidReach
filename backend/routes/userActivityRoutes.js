const express = require('express');
const { toggleUserActivity } = require('../controllers/userActivityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/toggle', protect, toggleUserActivity); // Route to toggle user activity

module.exports = router;

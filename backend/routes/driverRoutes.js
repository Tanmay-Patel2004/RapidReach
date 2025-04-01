const express = require('express');
const {
    updateDriverActiveTime,
    getAvailableOrders,
    claimOrder,
    updateDeliveryStatus,
    getDriverOrders
} = require('../controllers/driverController');
const { protect, isDriver } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/update-active-time', protect, updateDriverActiveTime); // Route to update driver active time

// New routes for driver order assignment - all require driver role
router.get('/available-orders', protect, isDriver, getAvailableOrders);
router.post('/claim-order/:orderId', protect, isDriver, claimOrder);
router.put('/update-delivery/:orderId', protect, isDriver, updateDeliveryStatus);
router.get('/my-orders', protect, isDriver, getDriverOrders);

module.exports = router;

const express = require('express');
const { checkout, updateOrderStatus, getAllOrders, getMonthlyReport, setOrderReadyForPickup } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/checkout', protect, checkout);
router.patch('/:id/status', protect, updateOrderStatus);
router.get('/orders', protect, getAllOrders);
router.get('/report', protect, getMonthlyReport);
router.put('/:id/ready-for-pickup', protect, setOrderReadyForPickup);

module.exports = router;

const express = require('express');
const { checkout, updateOrderStatus, getAllOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/checkout', protect, checkout);
router.patch('/:id/status', protect, updateOrderStatus);
router.get('/orders', protect, getAllOrders);

module.exports = router;

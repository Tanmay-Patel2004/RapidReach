const express = require('express');
const { checkout, updateOrderStatus, getAllOrders, getMonthlyReport, setOrderReadyForPickup } = require('../controllers/orderController');
const { protect, isWarehouseWorker } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/checkout', protect, checkout);
router.patch('/:id/status', protect, updateOrderStatus);
router.get('/orders', protect, getAllOrders);
router.get('/', protect, getAllOrders);
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await require('../models/orderModel').findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                code: 404,
                message: 'Order not found',
                data: null
            });
        }
        return res.status(200).json({
            code: 200,
            message: 'Order retrieved successfully',
            data: order
        });
    } catch (error) {
        console.error('❌ Get Order Error:', error);
        return res.status(500).json({
            code: 500,
            message: error.message,
            data: null
        });
    }
});
router.get('/report', protect, getMonthlyReport);
router.put('/:id/ready-for-pickup', protect, setOrderReadyForPickup);

module.exports = router;

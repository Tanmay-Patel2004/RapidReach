const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAllWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
} = require('../controllers/warehouseController');

// All routes are protected with authentication
router.use(protect);

// /api/warehouses
router.route('/')
    .get(getAllWarehouses)
    .post(createWarehouse);

// /api/warehouses/:id
router.route('/:id')
    .get(getWarehouseById)
    .put(updateWarehouse)
    .delete(deleteWarehouse);

module.exports = router; 
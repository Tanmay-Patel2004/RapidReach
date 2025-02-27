const Warehouse = require('../models/warehouseModel');

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
const getAllWarehouses = async (req, res) => {
    try {
        console.log('📝 Getting all warehouses...');
        const warehouses = await Warehouse.find({});
        console.log(`✅ Found ${warehouses.length} warehouses`);
        res.json(warehouses);
    } catch (error) {
        console.error('❌ Get All Warehouses Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get warehouse by ID
// @route   GET /api/warehouses/:id
// @access  Private
const getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ message: '❌ Warehouse not found' });
        }
        res.json(warehouse);
    } catch (error) {
        console.error('❌ Get Warehouse Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new warehouse
// @route   POST /api/warehouses
// @access  Private
const createWarehouse = async (req, res) => {
    try {
        const { warehouseCode, address } = req.body;

        // Check if warehouse with this code already exists
        const warehouseExists = await Warehouse.findOne({ warehouseCode });
        if (warehouseExists) {
            return res.status(400).json({ message: '❌ Warehouse code already exists' });
        }

        const warehouse = await Warehouse.create({
            warehouseCode,
            address
        });

        res.status(201).json({
            _id: warehouse._id,
            warehouseCode: warehouse.warehouseCode,
            address: warehouse.address
        });
    } catch (error) {
        console.error('❌ Create Warehouse Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private
const updateWarehouse = async (req, res) => {
    try {
        const { warehouseCode, address } = req.body;

        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ message: '❌ Warehouse not found' });
        }

        // If warehouse code is being changed, check if new code already exists
        if (warehouseCode && warehouseCode !== warehouse.warehouseCode) {
            const warehouseExists = await Warehouse.findOne({ warehouseCode });
            if (warehouseExists) {
                return res.status(400).json({ message: '❌ Warehouse code already exists' });
            }
        }

        // Update fields
        warehouse.warehouseCode = warehouseCode || warehouse.warehouseCode;
        if (address) {
            warehouse.address = {
                street: address.street || warehouse.address.street,
                province: address.province || warehouse.address.province,
                country: address.country || warehouse.address.country,
                zipCode: address.zipCode || warehouse.address.zipCode
            };
        }

        const updatedWarehouse = await warehouse.save();
        res.json(updatedWarehouse);
    } catch (error) {
        console.error('❌ Update Warehouse Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private
const deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ message: '❌ Warehouse not found' });
        }

        await warehouse.deleteOne();
        res.json({ message: '✅ Warehouse removed successfully' });
    } catch (error) {
        console.error('❌ Delete Warehouse Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
}; 
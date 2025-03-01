const Warehouse = require('../models/warehouseModel');
const { getHandlerResponse } = require('../middleware/responseMiddleware');
const httpStatus = require('../Helper/http_status');

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
const getAllWarehouses = async (req, res) => {
    try {
        console.log('📝 Getting all warehouses...');
        const warehouses = await Warehouse.find({});
        console.log(`✅ Found ${warehouses.length} warehouses`);
        const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Warehouses retrieved successfully', warehouses);
        return res.status(code).json({ code, message, data });
    } catch (error) {
        console.error('❌ Get All Warehouses Error:', error);
        const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
        return res.status(code).json({ code, message, data });
    }
};

// @desc    Get warehouse by ID
// @route   GET /api/warehouses/:id
// @access  Private
const getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) {
            const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Warehouse not found', null);
            return res.status(code).json({ code, message, data });
        }
        const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Warehouse retrieved successfully', warehouse);
        return res.status(code).json({ code, message, data });
    } catch (error) {
        console.error('❌ Get Warehouse Error:', error);
        const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
        return res.status(code).json({ code, message, data });
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
            const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Warehouse code already exists', null);
            return res.status(code).json({ code, message, data });
        }

        const warehouse = await Warehouse.create({
            warehouseCode,
            address
        });

        const { code, message, data } = getHandlerResponse(true, httpStatus.CREATED, 'Warehouse created successfully', warehouse);
        return res.status(code).json({ code, message, data });
    } catch (error) {
        console.error('❌ Create Warehouse Error:', error);
        const statusCode = error.name === 'ValidationError' ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
        const { code, message, data } = getHandlerResponse(false, statusCode, error.message, null);
        return res.status(code).json({ code, message, data });
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
            const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Warehouse not found', null);
            return res.status(code).json({ code, message, data });
        }

        // If warehouse code is being changed, check if new code already exists
        if (warehouseCode && warehouseCode !== warehouse.warehouseCode) {
            const warehouseExists = await Warehouse.findOne({ warehouseCode });
            if (warehouseExists) {
                const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Warehouse code already exists', null);
                return res.status(code).json({ code, message, data });
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
        const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Warehouse updated successfully', updatedWarehouse);
        return res.status(code).json({ code, message, data });
    } catch (error) {
        console.error('❌ Update Warehouse Error:', error);
        const statusCode = error.name === 'ValidationError' ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
        const { code, message, data } = getHandlerResponse(false, statusCode, error.message, null);
        return res.status(code).json({ code, message, data });
    }
};

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private
const deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) {
            const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Warehouse not found', null);
            return res.status(code).json({ code, message, data });
        }

        await warehouse.deleteOne();
        const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Warehouse removed successfully', null);
        return res.status(code).json({ code, message, data });
    } catch (error) {
        console.error('❌ Delete Warehouse Error:', error);
        const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
        return res.status(code).json({ code, message, data });
    }
};

module.exports = {
    getAllWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
}; 
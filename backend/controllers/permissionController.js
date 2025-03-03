const Permission = require('../models/permissionModel');
const { getHandlerResponse } = require('../middleware/responseMiddleware');
const httpStatus = require('../Helper/http_status');

// @desc    Create new permission
// @route   POST /api/permissions
// @access  Private
const createPermission = async (req, res) => {
  try {
    const { permission_id, name, title, description, isActive, sectionName } = req.body;

    // Log the request body for debugging
    console.log('📝 Creating permission with data:', {
      permission_id,
      name,
      title,
      description,
      isActive,
      sectionName
    });

    // Check if permission already exists with the same permission_id
    const permissionExists = await Permission.findOne({ permission_id });
    if (permissionExists) {
      console.log('❌ Permission with this ID already exists:', permission_id);
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Permission with this ID already exists', null);
      return res.status(code).json({ code, message, data });
    }

    // Create the permission
    const permission = await Permission.create({
      permission_id: Number(permission_id),
      name,
      title,
      description,
      isActive,
      sectionName
    });

    console.log('✅ Permission created successfully:', permission);
    const { code, message, data } = getHandlerResponse(true, httpStatus.CREATED, 'Permission created successfully', permission);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Create Permission Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Get all permissions
// @route   GET /api/permissions
// @access  Private
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find({});
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Permissions retrieved successfully', permissions);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get All Permissions Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Get permission by ID
// @route   GET /api/permissions/:id
// @access  Private
const getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Permission not found', null);
      return res.status(code).json({ code, message, data });
    }
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Permission retrieved successfully', permission);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get Permission Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Update permission
// @route   PUT /api/permissions/:id
// @access  Private
const updatePermission = async (req, res) => {
  try {
    const { name, title, description, isActive, sectionName } = req.body;

    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Permission not found', null);
      return res.status(code).json({ code, message, data });
    }

    permission.name = name || permission.name;
    permission.title = title || permission.title;
    permission.description = description || permission.description;
    permission.isActive = isActive !== undefined ? isActive : permission.isActive;
    permission.sectionName = sectionName || permission.sectionName;

    const updatedPermission = await permission.save();
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Permission updated successfully', updatedPermission);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Update Permission Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Delete permission
// @route   DELETE /api/permissions/:id
// @access  Private
const deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Permission not found', null);
      return res.status(code).json({ code, message, data });
    }

    await permission.deleteOne();
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Permission removed successfully', null);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Delete Permission Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

module.exports = {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
}; 
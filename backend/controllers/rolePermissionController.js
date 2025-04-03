const RolePermission = require('../models/rolePermissionModel');
const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const mongoose = require('mongoose');
const { getHandlerResponse } = require('../middleware/responseMiddleware');
const httpStatus = require('../Helper/http_status');

// @desc    Assign permission to role
// @route   POST /api/role-permissions
// @access  Private
const assignPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;
    console.log('📝 Request:', {
      roleId,
      permissionId,
      user: req.user,
      headers: req.headers
    });

    // Verify IDs are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(roleId) || !mongoose.Types.ObjectId.isValid(permissionId)) {
      console.log('❌ Invalid ObjectId format');
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Invalid ID format', null);
      return res.status(code).json({ code, message, data });
    }

    console.log(roleId);
    console.log(permissionId);
    console.log("--------------------------------");

    // Find role and permission in parallel
    const [role, permission] = await Promise.all([
      Role.findById(roleId),
      Permission.findById(permissionId)
    ]);

    console.log(Role);
    console.log(Permission);

    console.log('🔍 Database lookup results:', {
      role: role ? 'Found' : 'Not Found',
      permission: permission ? 'Found' : 'Not Found'
    });

    if (!role) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Role not found', null);
      return res.status(code).json({ code, message, data });
    }

    if (!permission) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Permission not found', null);
      return res.status(code).json({ code, message, data });
    }

    // Check if assignment already exists
    const existingAssignment = await RolePermission.findOne({ roleId, permissionId });
    console.log('🔍 Existing assignment:', existingAssignment);
    if (existingAssignment) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Permission already assigned to this role', null);
      return res.status(code).json({ code, message, data });
    }

    const rolePermission = await RolePermission.create({
      roleId,
      permissionId
    });
    console.log('✅ Created role-permission:', rolePermission);

    // Return populated response
    const populatedRolePermission = await RolePermission.findById(rolePermission._id)
      .populate('roleId', 'name description')
      .populate('permissionId', 'name title description');

    const { code, message, data } = getHandlerResponse(true, httpStatus.CREATED, 'Permission assigned to role successfully', populatedRolePermission);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Assign Permission Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Get all role permissions
// @route   GET /api/role-permissions
// @access  Private
const getAllRolePermissions = async (req, res) => {
  try {
    const rolePermissions = await RolePermission.find({})
      .populate('roleId', 'name description')
      .populate('permissionId', 'name title description');
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Role permissions retrieved successfully', rolePermissions);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get All Role Permissions Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Get permissions by role ID
// @route   GET /api/role-permissions/role/:roleId
// @access  Private
const getPermissionsByRoleId = async (req, res) => {
  try {
    const rolePermissions = await RolePermission.find({ roleId: req.params.roleId })
      .populate('permissionId', 'name title description sectionName');
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Role permissions retrieved successfully', rolePermissions);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get Role Permissions Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Get roles by permission ID
// @route   GET /api/role-permissions/permission/:permissionId
// @access  Private
const getRolesByPermissionId = async (req, res) => {
  try {
    const rolePermissions = await RolePermission.find({ permissionId: req.params.permissionId })
      .populate('roleId', 'name description');
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Permission roles retrieved successfully', rolePermissions);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get Permission Roles Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Remove permission from role
// @route   DELETE /api/role-permissions
// @access  Private
const removePermissionFromRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    const rolePermission = await RolePermission.findOneAndDelete({ roleId, permissionId });
    if (!rolePermission) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Role-Permission assignment not found', null);
      return res.status(code).json({ code, message, data });
    }

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Permission removed from role successfully', null);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Remove Permission Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Update permission role assignment
// @route   PUT /api/role-permissions/:id
// @access  Private
const updateRolePermission = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;
    const rolePermissionId = req.params.id;

    console.log('📝 Update Request:', {
      id: rolePermissionId,
      roleId,
      permissionId
    });

    // Verify IDs are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(roleId) ||
      !mongoose.Types.ObjectId.isValid(permissionId) ||
      !mongoose.Types.ObjectId.isValid(rolePermissionId)) {
      console.log('❌ Invalid ObjectId format');
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Invalid ID format', null);
      return res.status(code).json({ code, message, data });
    }

    // Find the role permission entry
    const existingRolePermission = await RolePermission.findById(rolePermissionId);
    if (!existingRolePermission) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Role-Permission assignment not found', null);
      return res.status(code).json({ code, message, data });
    }

    // Find role and permission in parallel
    const [role, permission] = await Promise.all([
      Role.findById(roleId),
      Permission.findById(permissionId)
    ]);

    if (!role) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Role not found', null);
      return res.status(code).json({ code, message, data });
    }

    if (!permission) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Permission not found', null);
      return res.status(code).json({ code, message, data });
    }

    // Check if the new assignment would be a duplicate (except for the current one)
    const duplicateCheck = await RolePermission.findOne({
      roleId,
      permissionId,
      _id: { $ne: rolePermissionId }
    });

    if (duplicateCheck) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'This permission is already assigned to this role', null);
      return res.status(code).json({ code, message, data });
    }

    // Update the role permission
    existingRolePermission.roleId = roleId;
    existingRolePermission.permissionId = permissionId;
    await existingRolePermission.save();

    // Return populated response
    const updatedRolePermission = await RolePermission.findById(rolePermissionId)
      .populate('roleId', 'name description')
      .populate('permissionId', 'name title description');

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Role-Permission assignment updated successfully', updatedRolePermission);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Update Role Permission Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Remove permission from role by ID
// @route   DELETE /api/role-permissions/:id
// @access  Private
const deleteRolePermissionById = async (req, res) => {
  try {
    const rolePermissionId = req.params.id;

    // Verify ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(rolePermissionId)) {
      console.log('❌ Invalid ObjectId format');
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Invalid ID format', null);
      return res.status(code).json({ code, message, data });
    }

    // Find and delete by ID
    const rolePermission = await RolePermission.findByIdAndDelete(rolePermissionId);
    if (!rolePermission) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Role-Permission assignment not found', null);
      return res.status(code).json({ code, message, data });
    }

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Permission removed from role successfully', null);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Delete Role Permission Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

module.exports = {
  assignPermissionToRole,
  getAllRolePermissions,
  getPermissionsByRoleId,
  getRolesByPermissionId,
  removePermissionFromRole,
  updateRolePermission,
  deleteRolePermissionById
}; 
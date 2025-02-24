const RolePermission = require('../models/rolePermissionModel');
const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const mongoose = require('mongoose');

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
      return res.status(400).json({ message: 'Invalid ID format' });
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
      return res.status(404).json({ message: '❌ Role not found' });
    }

    if (!permission) {
      return res.status(404).json({ message: '❌ Permission not found' });
    }

    // Check if assignment already exists
    const existingAssignment = await RolePermission.findOne({ roleId, permissionId });
    console.log('🔍 Existing assignment:', existingAssignment);
    if (existingAssignment) {
      return res.status(400).json({ message: '❌ Permission already assigned to this role' });
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

    res.status(201).json(populatedRolePermission);
  } catch (error) {
    console.error('❌ Assign Permission Error:', error);
    res.status(500).json({ message: error.message });
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
    res.json(rolePermissions);
  } catch (error) {
    console.error('❌ Get All Role Permissions Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get permissions by role ID
// @route   GET /api/role-permissions/role/:roleId
// @access  Private
const getPermissionsByRoleId = async (req, res) => {
  try {
    const rolePermissions = await RolePermission.find({ roleId: req.params.roleId })
      .populate('permissionId', 'name title description sectionName');
    res.json(rolePermissions);
  } catch (error) {
    console.error('❌ Get Role Permissions Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get roles by permission ID
// @route   GET /api/role-permissions/permission/:permissionId
// @access  Private
const getRolesByPermissionId = async (req, res) => {
  try {
    const rolePermissions = await RolePermission.find({ permissionId: req.params.permissionId })
      .populate('roleId', 'name description');
    res.json(rolePermissions);
  } catch (error) {
    console.error('❌ Get Permission Roles Error:', error);
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: '❌ Role-Permission assignment not found' });
    }

    res.json({ message: '✅ Permission removed from role successfully' });
  } catch (error) {
    console.error('❌ Remove Permission Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  assignPermissionToRole,
  getAllRolePermissions,
  getPermissionsByRoleId,
  getRolesByPermissionId,
  removePermissionFromRole
}; 
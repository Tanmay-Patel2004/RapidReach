const Role = require('../models/roleModel');
const { getHandlerResponse } = require('../middleware/responseMiddleware');
const httpStatus = require('../Helper/http_status');

// @desc    Create new role
// @route   POST /api/roles
// @access  Private
const createRole = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    // Check if role already exists
    const roleExists = await Role.findOne({ name });
    if (roleExists) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Role already exists', null);
      return res.status(code).json({ code, message, data });
    }

    const role = await Role.create({
      name,
      description,
      isActive
    });

    const { code, message, data } = getHandlerResponse(true, httpStatus.CREATED, 'Role created successfully', role);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Create Role Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Roles retrieved successfully', roles);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get All Roles Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Get role by ID
// @route   GET /api/roles/:id
// @access  Private
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Role not found', null);
      return res.status(code).json({ code, message, data });
    }
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Role retrieved successfully', role);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get Role Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private
const updateRole = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (!role) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Role not found', null);
      return res.status(code).json({ code, message, data });
    }

    role.name = name || role.name;
    role.description = description || role.description;
    role.isActive = isActive !== undefined ? isActive : role.isActive;

    const updatedRole = await role.save();
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Role updated successfully', updatedRole);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Update Role Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Role not found', null);
      return res.status(code).json({ code, message, data });
    }

    await role.deleteOne();
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Role removed successfully', null);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Delete Role Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
}; 
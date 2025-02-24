const Role = require('../models/roleModel');

// @desc    Create new role
// @route   POST /api/roles
// @access  Private
const createRole = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    // Check if role already exists
    const roleExists = await Role.findOne({ name });
    if (roleExists) {
      return res.status(400).json({ message: '❌ Role already exists' });
    }

    const role = await Role.create({
      name,
      description,
      isActive
    });

    res.status(201).json(role);
  } catch (error) {
    console.error('❌ Create Role Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    res.json(roles);
  } catch (error) {
    console.error('❌ Get All Roles Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get role by ID
// @route   GET /api/roles/:id
// @access  Private
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: '❌ Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('❌ Get Role Error:', error);
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: '❌ Role not found' });
    }

    role.name = name || role.name;
    role.description = description || role.description;
    role.isActive = isActive !== undefined ? isActive : role.isActive;

    const updatedRole = await role.save();
    res.json(updatedRole);
  } catch (error) {
    console.error('❌ Update Role Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: '❌ Role not found' });
    }

    await role.deleteOne();
    res.json({ message: '✅ Role removed successfully' });
  } catch (error) {
    console.error('❌ Delete Role Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
}; 
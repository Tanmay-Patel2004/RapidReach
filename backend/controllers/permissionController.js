const Permission = require('../models/permissionModel');

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
      return res.status(400).json({ message: '❌ Permission with this ID already exists' });
    }

    // Create the permission
    const permission = await Permission.create({
      permission_id: Number(permission_id), // Ensure permission_id is a number
      name,
      title,
      description,
      isActive,
      sectionName
    });

    console.log('✅ Permission created successfully:', permission);
    res.status(201).json(permission);
  } catch (error) {
    console.error('❌ Create Permission Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all permissions
// @route   GET /api/permissions
// @access  Private
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find({});
    res.json(permissions);
  } catch (error) {
    console.error('❌ Get All Permissions Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get permission by ID
// @route   GET /api/permissions/:id
// @access  Private
const getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: '❌ Permission not found' });
    }
    res.json(permission);
  } catch (error) {
    console.error('❌ Get Permission Error:', error);
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: '❌ Permission not found' });
    }

    permission.name = name || permission.name;
    permission.title = title || permission.title;
    permission.description = description || permission.description;
    permission.isActive = isActive !== undefined ? isActive : permission.isActive;
    permission.sectionName = sectionName || permission.sectionName;

    const updatedPermission = await permission.save();
    res.json(updatedPermission);
  } catch (error) {
    console.error('❌ Update Permission Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete permission
// @route   DELETE /api/permissions/:id
// @access  Private
const deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: '❌ Permission not found' });
    }

    await permission.deleteOne();
    res.json({ message: '✅ Permission removed successfully' });
  } catch (error) {
    console.error('❌ Delete Permission Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
}; 
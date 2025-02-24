const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Role = require('../models/roleModel');
const RolePermission = require('../models/rolePermissionModel');

// 🔹 Generate JWT Token
const generateToken = (id) => {
  console.log('🔑 Generating token for ID:', id);
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  console.log('✅ Token generated');
  return token;
};

// 🔹 @desc    Register User
// 🔹 @route   POST /api/auth/register
// 🔹 @access  Public
const register = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, email, password, role_id } = req.body;

    // Validate input
    if (!firstName || !lastName || !dateOfBirth || !email || !password || !role_id) {
      return res.status(400).json({ message: '❌ All fields are required' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: '❌ User already exists' });
    }

    // Validate role_id exists
    const roleExists = await Role.findById(role_id);
    if (!roleExists) {
      return res.status(400).json({ message: '❌ Invalid role' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      dateOfBirth,
      email,
      password,
      role_id
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role_id: user.role_id,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 @desc    Login User
// 🔹 @route   POST /api/auth/login
// 🔹 @access  Public
const login = async (req, res) => {
  try {
    console.log("📩 Login Request Body:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ Missing credentials");
      return res.status(400).json({ message: '❌ Email and password are required' });
    }

    // Populate user with role information
    const user = await User.findOne({ email })
      .populate({
        path: 'role_id',
        select: 'name'
      });

    console.log("🔍 User found:", user ? "Yes" : "No");

    if (user && (await user.matchPassword(password))) {
      // Get permissions for the user's role
      const rolePermissions = await RolePermission.find({ roleId: user.role_id._id })
        .populate({
          path: 'permissionId',
          select: 'permission_id name title description sectionName'
        });

      // Extract permissions from rolePermissions
      const permissions = rolePermissions.map(rp => rp.permissionId);

      const token = generateToken(user._id);
      console.log('🔑 Login successful, token:', token);

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: {
          _id: user.role_id._id,
          name: user.role_id.name
        },
        permissions: permissions,
        token
      });
    } else {
      console.log("❌ Invalid credentials");
      res.status(401).json({ message: '❌ Invalid email or password' });
    }
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login
};

const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Role = require('../models/roleModel');
const RolePermission = require('../models/rolePermissionModel');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

// 🔹 Generate JWT Token
const generateToken = (id) => {
  console.log('🔑 Generating token for ID:', id);
  console.log('JWT_SECRET status:', process.env.JWT_SECRET ? 'Exists' : 'Missing');

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const token = jwt.sign(
    {
      id,
      timestamp: Date.now()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );

  return token;
};

// 🔹 @desc    Register User
// 🔹 @route   POST /api/auth/register
// 🔹 @access  Public
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    firstName,
    lastName,
    dateOfBirth,
    phoneNumber,
    address
  } = req.body;

  // Validate required fields
  const missingFields = [];
  if (!email) missingFields.push('email');
  if (!password) missingFields.push('password');
  if (!firstName) missingFields.push('firstName');
  if (!lastName) missingFields.push('lastName');

  if (missingFields.length > 0) {
    res.status(400);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  try {
    // Create user with default customer role
    const user = await User.create({
      name: name || `${firstName} ${lastName}`, // Use combination if name not provided
      email,
      password,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || new Date('1900-01-01'), // Use default date if not provided
      phoneNumber: phoneNumber || null,
      role_id: '67bb9c6aee11822f1295c3e3', // Default customer role ID
      address: address || {
        street: null,
        unitNumber: null,
        province: null,
        country: null,
        zipCode: null
      }
    });

    if (user) {
      const token = generateToken(user._id);
      console.log('✅ User registered successfully:', { userId: user._id });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role_id: user.role_id,
        token
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400);
    throw new Error(error.message || 'Invalid user data');
  }
});

// 🔹 @desc    Login User
// 🔹 @route   POST /api/auth/login
// 🔹 @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  console.log('👤 Login attempt for email:', email);

  // Check for user email and populate role
  const user = await User.findOne({ email })
    .populate('role_id');

  if (!user) {
    console.log('❌ User not found:', email);
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Verify password
  if (await user.matchPassword(password)) {
    const token = generateToken(user._id);
    console.log('✅ Login successful for user:', {
      userId: user._id,
      role: user.role_id
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role_id: user.role_id,
      token
    });
  } else {
    console.log('❌ Invalid password for email:', email);
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

module.exports = {
  register,
  login
};

const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Role = require('../models/roleModel');
const RolePermission = require('../models/rolePermissionModel');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { getHandlerResponse } = require('../middleware/responseMiddleware');
const httpStatus = require('../Helper/http_status');

// Cookie options for JWT
const cookieOptions = {
  httpOnly: true, // Prevents JavaScript access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict', // Protection against CSRF
  maxAge: 1 * 60 * 1000, // 1 minute in milliseconds
  path: '/' // Cookie is available for all paths
};

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
    const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, `Missing required fields: ${missingFields.join(', ')}`, null);
    return res.status(code).json({ code, data, message });
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'User already exists with this email', null);
    return res.status(code).json({ code, data, message });
  }

  try {
    // Create user with default customer role
    const user = await User.create({
      name: name || `${firstName} ${lastName}`,
      email,
      password,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || new Date('1900-01-01'),
      phoneNumber: phoneNumber || null,
      role_id: '67bb9c6aee11822f1295c3e3',
      address: address || {
        street: null,
        unitNumber: null,
        province: null,
        country: null,
        zipCode: null
      }
    });

    if (user) {
      // Generate token and set cookie
      const token = generateToken(user._id);
      res.cookie('jwt', token, cookieOptions);

      console.log('✅ User registered successfully:', { userId: user._id });

      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role_id: user.role_id
      };

      const { code, message, data } = getHandlerResponse(true, httpStatus.CREATED, 'User registered successfully', userData);
      return res.status(code).json({ code, data, message });
    }
  } catch (error) {
    const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, error.message || 'Invalid user data', error);
    return res.status(code).json({ code, data, message });
  }
});

// 🔹 @desc    Login User
// 🔹 @route   POST /api/auth/login
// 🔹 @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Please provide email and password', null);
    return res.status(code).json({ code, data, message });
  }

  console.log('👤 Login attempt for email:', email);

  // Check for user email and populate role
  const user = await User.findOne({ email })
    .populate('role_id');

  if (!user) {
    console.log('❌ User not found:', email);
    const { code, message, data } = getHandlerResponse(false, httpStatus.UNAUTHORIZED, 'Invalid email or password', null);
    return res.status(code).json({ code, data, message });
  }

  // Verify password
  if (await user.matchPassword(password)) {
    // Generate token
    const token = generateToken(user._id);

    // Set cookie with more detailed options
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // set to true in production
      sameSite: 'lax',
      maxAge: 1 * 60 * 1000, // 1 minute in milliseconds
      path: '/'
    });

    console.log('Cookie being set:', {
      name: 'jwt',
      token: token,
      options: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1 * 60 * 1000, // 1 minute in milliseconds
      path: '/'
      }
    });

    // Fetch permissions for the user's role
    const rolePermissions = await RolePermission.find({ roleId: user.role_id._id })
      .populate({
        path: 'permissionId',
        select: 'permission_id name title description sectionName'
      });

    // Map permissions to a more readable format
    const permissions = rolePermissions.map(rp => rp.permissionId);

    console.log('✅ Login successful for user:', {
      userId: user._id,
      role: user.role_id,
      permissionsCount: permissions.length
    });

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role_id: user.role_id,
      permissions: permissions
    };

    const { code, message, data } = getHandlerResponse(
      true,
      httpStatus.OK,
      'Login successful',
      userData
    );

    res.status(code).json({ code, message, data });
  } else {
    console.log('❌ Invalid password for email:', email);
    const { code, message, data } = getHandlerResponse(false, httpStatus.UNAUTHORIZED, 'Invalid email or password', null);
    return res.status(code).json({ code, data, message });
  }
});

// 🔹 @desc    Logout User
// 🔹 @route   POST /api/auth/logout
// 🔹 @access  Private
const logout = asyncHandler(async (req, res) => {
  // Clear the jwt cookie
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  const { code, message, data } = getHandlerResponse(
    true,
    httpStatus.OK,
    'Logged out successfully',
    null
  );

  res.status(code).json({ code, message, data });
});

const verifyAuth = asyncHandler(async (req, res) => {
  // The protect middleware will have already verified the token
  // and attached the user to req.user
  const { code, message, data } = getHandlerResponse(
    true,
    httpStatus.OK,
    'Token verified',
    {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role_id: req.user.role_id,
      permissions: req.user.permissions,
    }
  );

  res.status(code).json({ code, message, data });
});

module.exports = {
  register,
  login,
  logout,
  verifyAuth
};

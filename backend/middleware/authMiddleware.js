const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const RolePermission = require('../models/rolePermissionModel');
const { getHandlerResponse } = require('./responseMiddleware');
const httpStatus = require('../Helper/http_status');

const protect = asyncHandler(async (req, res, next) => {
  console.log('=== Auth Middleware Debug ===');
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);
  console.log('Cookie Header:', req.headers.cookie);
  
  let token;

  // Try getting token from different sources
  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
    console.log('Token found in cookies');
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found in Authorization header');
  } else {
    console.log('No token found');
  }

  if (!token) {
    const { code, message, data } = getHandlerResponse(
      false,
      httpStatus.UNAUTHORIZED,
      'Not authorized, no token found',
      null
    );
    return res.status(code).json({ code, message, data });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully');

    // Get user from token with populated role_id
    req.user = await User.findById(decoded.id)
      .select('-password')
      .populate('role_id', '_id name description isActive');
    
    console.log('User with populated role:', req.user);
    
    if (!req.user) {
      throw new Error('User not found');
    }

    // Check if user has a role assigned
    if (!req.user.role_id) {
      const { code, message, data } = getHandlerResponse(
        false, 
        httpStatus.FORBIDDEN, 
        'Not authorized - No role assigned', 
        null
      );
      return res.status(code).json({ code, message, data });
    }

    try {
      // Get permissions for the user's role
      const rolePermissions = await RolePermission.find({ roleId: req.user.role_id._id })
        .populate({
          path: 'permissionId',
          select: 'permission_id name title description sectionName'
        });

      // Add permissions to user object
      req.user.permissions = rolePermissions.map(rp => rp.permissionId);
    } catch (permError) {
      console.error('Error fetching permissions:', permError);
      // Don't throw error here, just log it and continue with empty permissions
      req.user.permissions = [];
    }

    console.log('User authenticated successfully:', {
      userId: req.user._id,
      role: req.user.role_id.name,
      permissionsCount: req.user.permissions.length
    });

    next();
  } catch (error) {
    console.error('Auth Error:', error);
    const { code, message, data } = getHandlerResponse(
      false,
      httpStatus.UNAUTHORIZED,
      'Not authorized, token failed',
      null
    );
    return res.status(code).json({ code, message, data });
  }
});

// Middleware to check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(403);
      throw new Error('Not authorized - User not authenticated');
    }

    if (!req.user.role_id) {
      res.status(403);
      throw new Error('Not authorized - No role assigned');
    }

    if (!roles.includes(req.user.role_id.name)) {
      res.status(403);
      throw new Error(`Not authorized - Required roles: ${roles.join(', ')}`);
    }

    next();
  };
};

module.exports = { protect, authorize }; 
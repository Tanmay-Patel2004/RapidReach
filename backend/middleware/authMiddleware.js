const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const RolePermission = require('../models/rolePermissionModel');
const { getHandlerResponse } = require('./responseMiddleware');
const httpStatus = require('../Helper/http_status');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      console.log('Token received:', token ? 'Valid token' : 'Empty token');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully for user ID:', decoded.id);

      // Get user from token with populated role_id
      req.user = await User.findById(decoded.id)
        .select('-password')
        .populate('role_id');

      if (!req.user) {
        console.log('User not found with ID:', decoded.id);
        const { code, message, data } = getHandlerResponse(
          false,
          httpStatus.UNAUTHORIZED,
          'Not authorized, user not found',
          null
        );
        return res.status(code).json({ code, message, data });
      }

      console.log('User authenticated:', {
        userId: req.user._id,
        hasRole: !!req.user.role_id,
        role: req.user.role_id ? (typeof req.user.role_id === 'object' ? req.user.role_id.name : 'Non-populated role') : 'No role'
      });

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
        req.user.permissions = [];
      }

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
  }

  if (!token) {
    const { code, message, data } = getHandlerResponse(
      false,
      httpStatus.UNAUTHORIZED,
      'Not authorized, no token',
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

// Middleware to check if the user is a driver
const isDriver = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: 'Not authorized, no token',
        data: null
      });
    }

    // Add debugging
    console.log('User role check:', {
      userId: req.user._id,
      hasRoleId: !!req.user.role_id,
      roleName: req.user.role_id ? (typeof req.user.role_id === 'object' ? req.user.role_id.name : req.user.role_id) : 'none',
      roleObject: req.user.role_id
    });

    // Check if user has a driver role OR is a superadmin
    // Allow both objects (populated) and string IDs (non-populated)
    const roleId = req.user.role_id;

    // Case 1: role_id is populated as an object
    if (typeof roleId === 'object' && roleId !== null) {
      const roleName = roleId.name?.toLowerCase();
      if (roleName === 'driver' || roleName === 'super admin' || roleName === 'superadmin' || roleName === 'admin') {
        return next();
      }
    }
    // Case 2: We have the role as a string ID or name
    else if (typeof roleId === 'string') {
      // If we just have the ID, we'll need to fetch the role
      const Role = require('../models/roleModel');
      const role = await Role.findById(roleId);

      if (role) {
        const roleName = role.name.toLowerCase();
        if (roleName === 'driver' || roleName === 'super admin' || roleName === 'superadmin' || roleName === 'admin') {
          return next();
        }
      }
    }

    // If we reach here, the user doesn't have the required role
    return res.status(403).json({
      code: 403,
      message: 'Not authorized, driver or admin access required',
      data: null
    });
  } catch (error) {
    console.error('❌ Driver Auth Error:', error);
    return res.status(500).json({
      code: 500,
      message: 'Server error during authorization',
      data: null
    });
  }
};

module.exports = { protect, authorize, isDriver }; 
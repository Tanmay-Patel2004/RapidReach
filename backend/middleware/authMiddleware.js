const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const RolePermission = require('../models/rolePermissionModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('Auth Header:', req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      console.log('Token being verified:', token);
      console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Exists' : 'Missing');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      // Get user from the token with role populated
      const user = await User.findById(decoded.id)
        .select('-password')
        .populate('role_id');

      if (!user) {
        res.status(401);
        throw new Error('User not found');
      }

      // Check if user has a role assigned
      if (!user.role_id) {
        res.status(401);
        throw new Error('User has no role assigned');
      }

      // Store user in request
      req.user = user;

      try {
        // Get permissions for the user's role
        const rolePermissions = await RolePermission.find({ roleId: user.role_id._id })
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
        userId: user._id,
        role: user.role_id.name,
        permissionsCount: req.user.permissions.length
      });

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401);

      if (error.name === 'JsonWebTokenError') {
        throw new Error('Not authorized - Invalid token');
      } else if (error.name === 'TokenExpiredError') {
        throw new Error('Not authorized - Token expired');
      } else {
        throw new Error(`Not authorized - ${error.message}`);
      }
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token provided');
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
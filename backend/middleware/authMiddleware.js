const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const RolePermission = require('../models/rolePermissionModel');

const protect = async (req, res, next) => {
  try {
    let token;
    console.log('🔑 Auth Headers:', req.headers.authorization);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        console.log('🔑 Extracted Token:', token);

        if (!token) {
          console.log('❌ No token found in Bearer header');
          return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Decoded Token:', decoded);

        const user = await User.findById(decoded.id)
          .populate({
            path: 'role_id',
            select: 'name'
          });

        if (!user) {
          console.log('❌ No user found with token ID');
          return res.status(401).json({ message: 'User not found' });
        }

        // Get permissions for the user's role
        const rolePermissions = await RolePermission.find({ roleId: user.role_id._id })
          .populate({
            path: 'permissionId',
            select: 'permission_id name title description sectionName'
          });

        // Add permissions to user object
        user.permissions = rolePermissions.map(rp => rp.permissionId);

        req.user = user;
        next();
      } catch (error) {
        console.error('❌ Token verification error:', error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    } else {
      console.log('❌ No Bearer token in Authorization header');
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { protect }; 
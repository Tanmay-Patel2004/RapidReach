const checkPermission = (requiredPermissionId) => {
  return (req, res, next) => {
    // Temporarily bypass all permission checks
    // return next();

    const userPermissions = req.user.permissions || [];
    
    console.log('🔍 Permission Check Details:', {
      requiredPermissionId,
      userRole: req.user.role_id.name,
      userPermissions: userPermissions.map(p => ({
        id: p.permission_id,
        name: p.name,
        type: typeof p.permission_id
      })),
      hasPermissions: userPermissions.length > 0
    });

    const hasRequiredPermission = userPermissions.some(
      permission => Number(permission.permission_id) === Number(requiredPermissionId)
    );

    if (!hasRequiredPermission) {
      console.log('❌ Permission denied:', {
        userId: req.user._id,
        roleName: req.user.role_id.name,
        requiredPermission: requiredPermissionId,
        availablePermissions: userPermissions.map(p => p.permission_id)
      });
      return res.status(403).json({
        message: '❌ You do not have permission to perform this action'
      });
    }

    console.log('✅ Permission granted for:', requiredPermissionId);
    next();
    
  };
};

module.exports = { checkPermission }; 
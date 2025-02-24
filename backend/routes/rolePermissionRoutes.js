const express = require('express');
const router = express.Router();
const {
  assignPermissionToRole,
  getAllRolePermissions,
  getPermissionsByRoleId,
  getRolesByPermissionId,
  removePermissionFromRole
} = require('../controllers/rolePermissionController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const { PERMISSION_IDS } = require('../constants/permissions');
const { setupSuperAdminPermissions } = require('../utils/setupSuperAdmin');
const RolePermission = require('../models/rolePermissionModel');
const Permission = require('../models/permissionModel');

// All routes are protected
router.use(protect);

// Debug middleware
router.use((req, res, next) => {
  console.log('🔍 Role-Permission Route Hit:', {
    method: req.method,
    path: req.path,
    body: req.body,
    user: req.user
  });
  next();
});

router.route('/')
  .post(checkPermission(PERMISSION_IDS.ASSIGN_PERMISSION_TO_ROLE), assignPermissionToRole)
  .get(checkPermission(PERMISSION_IDS.READ_ALL_ROLE_PERMISSIONS), getAllRolePermissions)
  .delete(checkPermission(PERMISSION_IDS.REMOVE_PERMISSION_FROM_ROLE), removePermissionFromRole);

router.route('/role/:roleId')
  .get(checkPermission(PERMISSION_IDS.READ_ALL_ROLE_PERMISSIONS), getPermissionsByRoleId);

router.route('/permission/:permissionId')
  .get(checkPermission(PERMISSION_IDS.READ_ALL_ROLE_PERMISSIONS), getRolesByPermissionId);

// Add this route temporarily
router.post('/setup-superadmin', async (req, res) => {
  try {
    await setupSuperAdminPermissions();
    res.json({ message: '✅ Superadmin permissions setup complete' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this route for debugging
router.get('/check-role-permissions/:roleId', async (req, res) => {
  try {
    const rolePermissions = await RolePermission.find({ roleId: req.params.roleId })
      .populate('permissionId')
      .populate('roleId');

    res.json({
      role: rolePermissions[0]?.roleId,
      permissions: rolePermissions.map(rp => rp.permissionId)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this route for debugging
router.get('/verify-permissions', async (req, res) => {
  try {
    const allPermissions = await Permission.find({}).select('permission_id name');
    const allRolePermissions = await RolePermission.find({})
      .populate('roleId', 'name')
      .populate('permissionId', 'permission_id name');

    res.json({
      availablePermissions: allPermissions.map(p => ({
        id: p.permission_id,
        name: p.name
      })),
      rolePermissions: allRolePermissions.map(rp => ({
        role: rp.roleId.name,
        permission: {
          id: rp.permissionId.permission_id,
          name: rp.permissionId.name
        }
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
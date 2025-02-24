const express = require('express');
const router = express.Router();
const {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
} = require('../controllers/permissionController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const { PERMISSION_IDS } = require('../constants/permissions');

// All routes are protected
router.use(protect);

router.route('/')
  .post(checkPermission(PERMISSION_IDS.ADD_SINGLE_PERMISSION), createPermission)
  .get(checkPermission(PERMISSION_IDS.READ_ALL_PERMISSIONS), getAllPermissions);

router.route('/:id')
  .get(checkPermission(PERMISSION_IDS.FETCH_SINGLE_PERMISSION), getPermissionById)
  .put(checkPermission(PERMISSION_IDS.EDIT_SINGLE_PERMISSION), updatePermission)
  .delete(checkPermission(PERMISSION_IDS.DELETE_SINGLE_PERMISSION), deletePermission);

module.exports = router; 
const express = require('express');
const router = express.Router();
const {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor
} = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const { PERMISSION_IDS } = require('../constants/permissions');

// All routes are protected
router.use(protect);

router.route('/')
  .post(checkPermission(PERMISSION_IDS.ADD_SINGLE_VENDOR), createVendor)
  .get(checkPermission(PERMISSION_IDS.READ_ALL_VENDORS), getAllVendors);

router.route('/:id')
  .get(checkPermission(PERMISSION_IDS.FETCH_SINGLE_VENDOR), getVendorById)
  .put(checkPermission(PERMISSION_IDS.EDIT_SINGLE_VENDOR), updateVendor)
  .delete(checkPermission(PERMISSION_IDS.DELETE_SINGLE_VENDOR), deleteVendor);

module.exports = router; 
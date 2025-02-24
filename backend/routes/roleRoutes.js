const express = require('express');
const router = express.Router();
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
} = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const { PERMISSION_IDS } = require('../constants/permissions');
const Role = require('../models/roleModel');

// All routes are protected
router.use(protect);

router.route('/')
  .post(checkPermission(PERMISSION_IDS.ADD_SINGLE_ROLE), createRole)
  .get(checkPermission(PERMISSION_IDS.READ_ALL_ROLES), getAllRoles);

router.route('/:id')
  .get(checkPermission(PERMISSION_IDS.FETCH_SINGLE_ROLE), getRoleById)
  .put(checkPermission(PERMISSION_IDS.EDIT_SINGLE_ROLE), updateRole)
  .delete(checkPermission(PERMISSION_IDS.DELETE_SINGLE_ROLE), deleteRole);

router.route('/by-name/:name')
  .get(async (req, res) => {
    try {
      const role = await Role.findOne({ name: req.params.name.toLowerCase() });
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router; 
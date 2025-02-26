const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { checkPermission } = require('../middleware/permissionMiddleware');
const { PERMISSION_IDS } = require('../constants/permissions');

// All routes are protected
router.use(protect);

// /api/users
router.route('/')
  .get(checkPermission(PERMISSION_IDS.READ_ALL_USERS), getAllUsers);

// /api/users/:id
router.route('/:id')
  .get(getUserById)
  .put(checkPermission(PERMISSION_IDS.EDIT_SINGLE_USER), upload.single('profilePicture'), updateUser)
  .delete(deleteUser);

module.exports = router; 
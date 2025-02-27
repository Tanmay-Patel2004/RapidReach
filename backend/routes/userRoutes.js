const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const { uploadProfilePicture } = require('../middleware/uploadMiddleware');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { PERMISSION_IDS } = require('../constants/permissions');

// Test route for AWS configuration
router.get('/test-s3', async (req, res) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME
    };

    const result = await s3.listObjects(params).promise();
    res.json({
      message: 'AWS S3 Connection Successful',
      bucketContents: result.Contents
    });
  } catch (error) {
    console.error('AWS Test Error:', error);
    res.status(500).json({
      message: 'AWS Connection Failed',
      error: {
        code: error.code,
        message: error.message
      }
    });
  }
});

// All routes are protected
router.use(protect);

// /api/users
router.route('/')
  .get(checkPermission(PERMISSION_IDS.READ_ALL_USERS), getAllUsers);

// /api/users/:id
router.route('/:id')
  .get(getUserById)
  .put(checkPermission(PERMISSION_IDS.EDIT_SINGLE_USER), uploadProfilePicture, updateUser)
  .delete(deleteUser);

module.exports = router; 
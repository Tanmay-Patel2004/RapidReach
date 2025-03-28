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
  createUser,
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

// Apply protect middleware to all routes in this router
router.use(protect);

// Add this debug route at the top of your users routes
router.get('/debug', (req, res) => {
  console.log('Debug Info:');
  console.log('Cookies:', req.cookies);
  console.log('Headers:', req.headers);
  
  res.json({
    cookies: req.cookies,
    cookieHeader: req.headers.cookie,
    allHeaders: req.headers
  });
});

// /api/users
router.route('/')
  .get(checkPermission(PERMISSION_IDS.READ_ALL_USERS), getAllUsers)
  .post(createUser);

// /api/users/:id
router.route('/:id')
  .get(getUserById)
  .put(checkPermission(PERMISSION_IDS.EDIT_SINGLE_USER), uploadProfilePicture, updateUser)
  .delete(deleteUser);

module.exports = router;
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
  .get((req, res, next) => {
    // Allow users to fetch their own profile without permission check
    const requestedUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    console.log('Profile fetch request:', {
      requestedUserId,
      currentUserId,
      isSameUser: requestedUserId === currentUserId
    });

    if (requestedUserId === currentUserId) {
      console.log('✅ User fetching their own profile - bypassing permission check');
      return next();
    }

    // For users fetching other users' profiles, check for proper permission
    console.log('👮 User attempting to fetch another user - checking for permission');
    return checkPermission(PERMISSION_IDS.FETCH_SINGLE_USER)(req, res, next);
  }, getUserById)
  .put((req, res, next) => {
    // Allow users to update their own profile without permission check
    const requestedUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    console.log('Profile update request:', {
      requestedUserId,
      currentUserId,
      isSameUser: requestedUserId === currentUserId
    });

    if (requestedUserId === currentUserId) {
      console.log('✅ User updating their own profile - bypassing permission check');
      return next();
    }

    // For admins updating other users, check for proper permission
    console.log('👮 User attempting to update another user - checking for admin permission');
    return checkPermission(PERMISSION_IDS.EDIT_SINGLE_USER)(req, res, next);
  }, uploadProfilePicture, updateUser)
  .delete((req, res, next) => {
    // Allow users to delete their own account without permission check
    const requestedUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    console.log('Account deletion request:', {
      requestedUserId,
      currentUserId,
      isSameUser: requestedUserId === currentUserId
    });

    if (requestedUserId === currentUserId) {
      console.log('✅ User deleting their own account - bypassing permission check');
      return next();
    }

    // For admins deleting other users, check for proper permission
    console.log('👮 User attempting to delete another user - checking for admin permission');
    return checkPermission(PERMISSION_IDS.DELETE_SINGLE_USER)(req, res, next);
  }, deleteUser);

module.exports = router;
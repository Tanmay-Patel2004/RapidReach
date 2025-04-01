const User = require('../models/userModel');
const uploadToS3 = require('../utils/s3Upload');
const { getHandlerResponse } = require('../middleware/responseMiddleware');
const httpStatus = require('../Helper/http_status');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    console.log('👤 Request user:', req.user);
    console.log('📝 Getting all users...');

    const users = await User.find({})
      .select('-password')
      .populate('role_id', '_id name description isActive');
    console.log(`✅ Found ${users.length} users`);

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Users retrieved successfully', users);
    return res.status(code).json({ code, message, data });
    return res.send("./view/login.ejs", users.username);
  } catch (error) {
    console.error('❌ Get All Users Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('role_id', '_id name description isActive');
    if (!user) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'User not found', null);
      return res.status(code).json({ code, message, data });
    }
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'User retrieved successfully', user);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get User Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    // Log the request for debugging
    console.log('Update user request received:', {
      userId: req.params.id,
      requestBodyKeys: Object.keys(req.body),
      hasProfilePicture: !!req.body.profilePicture,
      isBase64Image: req.body.profilePicture?.startsWith('data:image'),
      requestHeaders: req.headers,
      currentUserId: req.user?._id
    });

    // Check if any update fields are provided
    if (Object.keys(req.body).length === 0 && !req.file) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'No update fields provided', null);
      return res.status(code).json({ code, message, data });
    }

    const {
      name,
      email,
      dateOfBirth,
      phoneNumber,
      address,
      role_id,
      isEmailVerified,
      profilePicture
    } = req.body;

    // Find the user to update
    const user = await User.findById(req.params.id);
    if (!user) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'User not found', null);
      return res.status(code).json({ code, message, data });
    }

    // Handle profile picture
    let profilePictureUrl = user.profilePicture;

    // If a profile picture is provided as base64 string
    if (profilePicture && profilePicture.startsWith('data:image')) {
      try {
        console.log('Processing base64 profile picture');

        // Extract the mime type and base64 data
        const matches = profilePicture.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
          throw new Error('Invalid base64 image format');
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        // Create a buffer from the base64 data
        const buffer = Buffer.from(base64Data, 'base64');

        // Check file size - limit to 5MB
        if (buffer.length > 5 * 1024 * 1024) {
          throw new Error('Image file is too large (max 5MB)');
        }

        // Create a virtual file object for S3 upload
        const virtualFile = {
          originalname: `profile-${req.params.id}-${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`,
          buffer: buffer,
          mimetype: mimeType
        };

        // Upload to S3
        profilePictureUrl = await uploadToS3(virtualFile);
        console.log('Profile picture uploaded to S3:', profilePictureUrl);
      } catch (uploadError) {
        console.error('❌ Detailed Upload Error:', uploadError);
        const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Error uploading profile picture', { details: uploadError.message });
        return res.status(code).json({ code, message, data });
      }
    } else if (req.file) {
      // Handle multipart form upload if present
      try {
        profilePictureUrl = await uploadToS3(req.file);
      } catch (uploadError) {
        console.error('❌ Detailed Upload Error:', uploadError);
        const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Error uploading profile picture', { details: uploadError.message });
        return res.status(code).json({ code, message, data });
      }
    }

    // Create an update object with only the fields that are provided
    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
    if (role_id !== undefined) updateFields.role_id = role_id;
    if (typeof isEmailVerified === 'boolean') updateFields.isEmailVerified = isEmailVerified;
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
    if (profilePictureUrl !== undefined) updateFields.profilePicture = profilePictureUrl;

    // Update address fields if provided
    if (address) {
      updateFields.address = {
        street: address.street ?? user.address?.street ?? null,
        unitNumber: address.unitNumber ?? user.address?.unitNumber ?? null,
        province: address.province ?? user.address?.province ?? null,
        country: address.country ?? user.address?.country ?? null,
        zipCode: address.zipCode ?? user.address?.zipCode ?? null
      };
    }

    // Check if there are any actual updates to be made
    if (Object.keys(updateFields).length === 0) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'No valid update fields provided', null);
      return res.status(code).json({ code, message, data });
    }

    // Update the user with the provided fields
    Object.assign(user, updateFields);

    // Validate the updated user data
    try {
      await user.validate();
    } catch (validationError) {
      console.error('Validation Error Details:', validationError);
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Validation Error', { details: validationError.message });
      return res.status(code).json({ code, message, data });
    }

    const updatedUser = await user.save();
    const userData = {
      address: updatedUser.address,
      profilePicture: updatedUser.profilePicture,
      isEmailVerified: updatedUser.isEmailVerified,
      phoneNumber: updatedUser.phoneNumber,
      _id: updatedUser._id,
      dateOfBirth: updatedUser.dateOfBirth,
      email: updatedUser.email,
      role_id: updatedUser.role_id,
      name: updatedUser.name,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      __v: updatedUser.__v
    };

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'User updated successfully', userData);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Update User Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'User not found', null);
      return res.status(code).json({ code, message, data });
    }

    await user.deleteOne();
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'User removed successfully', null);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Delete User Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Private
const createUser = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, phoneNumber, address, role_id } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.CONFLICT, 'Email already exists', null);
      return res.status(code).json({ code, message, data });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
      dateOfBirth,
      phoneNumber,
      address,
      role_id
    });

    // Save the user
    const savedUser = await user.save();
    const userData = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      dateOfBirth: savedUser.dateOfBirth,
      phoneNumber: savedUser.phoneNumber,
      address: savedUser.address,
      role_id: savedUser.role_id,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    };

    const { code, message, data } = getHandlerResponse(true, httpStatus.CREATED, 'User created successfully', userData);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Create User Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser, // Export the new method
};
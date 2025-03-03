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

    const users = await User.find({}).select('-password');
    console.log(`✅ Found ${users.length} users`);

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Users retrieved successfully', users);
    return res.status(code).json({ code, message, data });
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
    const user = await User.findById(req.params.id).select('-password');
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
    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      phoneNumber,
      address
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'User not found', null);
      return res.status(code).json({ code, message, data });
    }

    // Handle profile picture upload if file is present
    let profilePictureUrl = user.profilePicture;
    if (req.file) {
      try {
        console.log('📁 Received file:', {
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });

        profilePictureUrl = await uploadToS3(req.file);
      } catch (uploadError) {
        console.error('❌ Detailed Upload Error:', uploadError);
        const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Error uploading profile picture', { details: uploadError.message });
        return res.status(code).json({ code, message, data });
      }
    }

    // Update basic fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.profilePicture = profilePictureUrl;

    // Update phone number if provided
    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }

    // Update address fields if provided
    if (address) {
      user.address = {
        street: address.street || user.address?.street,
        unitNumber: address.unitNumber || user.address?.unitNumber,
        province: address.province || user.address?.province,
        country: address.country || user.address?.country,
        zipCode: address.zipCode || user.address?.zipCode
      };
    }

    // Validate the updated user data
    try {
      await user.validate();
    } catch (validationError) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Validation Error', { details: validationError.message });
      return res.status(code).json({ code, message, data });
    }

    const updatedUser = await user.save();
    const userData = {
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      dateOfBirth: updatedUser.dateOfBirth,
      profilePicture: updatedUser.profilePicture,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address
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

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
}; 
const User = require('../models/userModel');
const uploadToS3 = require('../utils/s3Upload');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    console.log('👤 Request user:', req.user);
    console.log('📝 Getting all users...');

    const users = await User.find({}).select('-password');
    console.log(`✅ Found ${users.length} users`);

    res.json(users);
  } catch (error) {
    console.error('❌ Get All Users Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('❌ Get User Error:', error);
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: '❌ User not found' });
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
        return res.status(400).json({
          message: 'Error uploading profile picture',
          details: uploadError.message
        });
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
      return res.status(400).json({
        message: 'Validation Error',
        details: validationError.message
      });
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      dateOfBirth: updatedUser.dateOfBirth,
      profilePicture: updatedUser.profilePicture,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address
    });
  } catch (error) {
    console.error('❌ Update User Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }

    await user.deleteOne();
    res.json({ message: '✅ User removed successfully' });
  } catch (error) {
    console.error('❌ Delete User Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
}; 
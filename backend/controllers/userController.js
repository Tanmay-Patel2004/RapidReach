const User = require('../models/userModel');
const cloudinary = require('cloudinary').v2;

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
    const { firstName, lastName, email, dateOfBirth } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }

    // Update fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;

    // Handle profile picture upload
    if (req.file) {
      // If user already has a profile picture, delete it from cloudinary
      if (user.profilePicture && user.profilePicture !== 'https://res.cloudinary.com/rapidreach/image/upload/v1/default-avatar.png') {
        const publicId = user.profilePicture.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // Update with new profile picture URL
      user.profilePicture = req.file.path;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      dateOfBirth: updatedUser.dateOfBirth,
      profilePicture: updatedUser.profilePicture,
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
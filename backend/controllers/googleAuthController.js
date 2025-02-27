const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Default customer role ID
const CUSTOMER_ROLE_ID = '67bb9c6aee11822f1295c3e3';

// @desc    Authenticate user with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        res.status(400);
        throw new Error('ID Token is required');
    }

    try {
        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        console.log('Google Auth Payload:', payload);

        if (!payload) {
            res.status(401);
            throw new Error('Invalid payload from Google');
        }

        const {
            sub: googleId,
            email,
            name,
            picture,
            given_name: firstName,
            family_name: lastName
        } = payload;

        // Check if user exists
        let user = await User.findOne({ googleId }).populate('role_id');

        if (!user) {
            // Check if user exists with same email
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                // Link Google ID to existing account
                existingUser.googleId = googleId;
                existingUser.isEmailVerified = true;
                if (!existingUser.profilePicture && picture) {
                    existingUser.profilePicture = picture;
                }
                user = await existingUser.save();
            } else {
                // Create new user with customer role
                const [firstNamePart, lastNamePart] = name.split(' ');
                user = await User.create({
                    name,
                    email,
                    googleId,
                    profilePicture: picture,
                    isEmailVerified: true,
                    firstName: firstName || firstNamePart || 'Unknown',
                    lastName: lastName || lastNamePart || 'Unknown',
                    dateOfBirth: new Date('1900-01-01'), // Default date, user can update later
                    role_id: CUSTOMER_ROLE_ID, // Set default customer role
                    phoneNumber: null,
                    address: {
                        street: null,
                        unitNumber: null,
                        province: null,
                        country: null,
                        zipCode: null
                    }
                });
            }
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                role_id: user.role_id
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role_id: user.role_id,
            profilePicture: user.profilePicture,
            isEmailVerified: user.isEmailVerified,
            token
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401);
        throw new Error(`Google authentication failed: ${error.message}`);
    }
});

module.exports = {
    googleLogin
}; 
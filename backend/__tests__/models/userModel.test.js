const mongoose = require('mongoose');
const User = require('../../models/userModel');
const { dbConnect, dbDisconnect, dbClear } = require('../testUtils');

describe('User Model Test', () => {
    // Connect to the in-memory database before all tests
    beforeAll(async () => {
        await dbConnect();
    });

    // Clear all test data after each test
    afterEach(async () => {
        await dbClear();
    });

    // Disconnect and close connection after all tests
    afterAll(async () => {
        await dbDisconnect();
    });

    it('should create & save user successfully', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            dateOfBirth: new Date('1990-01-01'),
            role_id: new mongoose.Types.ObjectId(),
        };

        const validUser = new User(userData);
        const savedUser = await validUser.save();

        // Object Id should be defined when successfully saved to MongoDB
        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(userData.name);
        expect(savedUser.email).toBe(userData.email);
        // Password should be hashed, not the same as original
        expect(savedUser.password).not.toBe(userData.password);
        expect(savedUser.isEmailVerified).toBe(false); // Default value
    });

    it('should fail validation when email is missing', async () => {
        const userWithoutEmail = new User({
            name: 'Test User',
            password: 'password123',
            dateOfBirth: new Date('1990-01-01'),
            role_id: new mongoose.Types.ObjectId(),
        });

        let error;
        try {
            await userWithoutEmail.validate();
        } catch (e) {
            error = e;
        }

        expect(error).toBeDefined();
        expect(error.errors.email).toBeDefined();
        expect(error.errors.email.kind).toBe('required');
    });

    it('should fail validation when password is too short', async () => {
        const userWithShortPassword = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: '12345', // Less than 6 characters
            dateOfBirth: new Date('1990-01-01'),
            role_id: new mongoose.Types.ObjectId(),
        });

        let error;
        try {
            await userWithShortPassword.validate();
        } catch (e) {
            error = e;
        }

        expect(error).toBeDefined();
        expect(error.errors.password).toBeDefined();
        expect(error.errors.password.kind).toBe('minlength');
    });

    it('should correctly compare passwords', async () => {
        const password = 'password123';
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password,
            dateOfBirth: new Date('1990-01-01'),
            role_id: new mongoose.Types.ObjectId(),
        };

        const validUser = new User(userData);
        const savedUser = await validUser.save();

        // Test correct password
        const isMatch = await savedUser.matchPassword(password);
        expect(isMatch).toBe(true);

        // Test incorrect password
        const isNotMatch = await savedUser.matchPassword('wrongpassword');
        expect(isNotMatch).toBe(false);
    });

    it('should not require password if Google ID is present', async () => {
        const userWithGoogleId = new User({
            name: 'Google User',
            email: 'google@example.com',
            googleId: '123456789',
            dateOfBirth: new Date('1990-01-01'),
            role_id: new mongoose.Types.ObjectId(),
        });

        let error;
        try {
            await userWithGoogleId.validate();
        } catch (e) {
            error = e;
        }

        expect(error).toBeUndefined();
    });
}); 
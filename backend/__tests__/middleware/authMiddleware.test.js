const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { protect } = require('../../middleware/authMiddleware');
const User = require('../../models/userModel');
const { dbConnect, dbDisconnect, dbClear } = require('../testUtils');

describe('Auth Middleware Tests', () => {
    let testUser, mockReq, mockRes, mockNext;

    beforeAll(async () => {
        await dbConnect();

        // Create a test user
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            dateOfBirth: new Date('1990-01-01'),
            role_id: new mongoose.Types.ObjectId()
        });
    });

    afterAll(async () => {
        await dbDisconnect();
    });

    beforeEach(() => {
        // Mock Express request and response
        mockReq = {
            headers: {},
            cookies: {}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockNext = jest.fn();
    });

    it('should throw 401 error if no token provided', async () => {
        // No token in request
        await protect(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('Not authorized')
        }));
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should authenticate user with valid token in Authorization header', async () => {
        // Generate a valid token
        const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
        mockReq.headers.authorization = `Bearer ${token}`;

        await protect(mockReq, mockRes, mockNext);

        expect(mockReq.user).toBeDefined();
        expect(mockReq.user._id.toString()).toBe(testUser._id.toString());
        expect(mockNext).toHaveBeenCalled();
    });

    it('should authenticate user with valid token in cookie', async () => {
        // Generate a valid token
        const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
        mockReq.cookies.jwt = token;

        await protect(mockReq, mockRes, mockNext);

        expect(mockReq.user).toBeDefined();
        expect(mockReq.user._id.toString()).toBe(testUser._id.toString());
        expect(mockNext).toHaveBeenCalled();
    });

    it('should throw 401 error if token is invalid', async () => {
        mockReq.headers.authorization = 'Bearer invalidtoken';

        await protect(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('Not authorized')
        }));
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw 401 error if user does not exist', async () => {
        // Generate token with non-existent user ID
        const nonExistentId = new mongoose.Types.ObjectId();
        const token = jwt.sign({ id: nonExistentId }, process.env.JWT_SECRET);
        mockReq.headers.authorization = `Bearer ${token}`;

        await protect(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('Not authorized')
        }));
        expect(mockNext).not.toHaveBeenCalled();
    });
}); 
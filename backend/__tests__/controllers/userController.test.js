const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/userModel');
const Role = require('../../models/roleModel');
const { dbConnect, dbDisconnect, dbClear, createTestUser, createAdminRole, generateToken } = require('../testUtils');

describe('User Controller Tests', () => {
    let testUser, adminUser, adminRole, userToken, adminToken;

    beforeAll(async () => {
        await dbConnect();
        // Create an admin role
        adminRole = await createAdminRole();

        // Create a regular test user
        testUser = await createTestUser();
        userToken = generateToken(testUser);

        // Create an admin user
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            dateOfBirth: new Date('1990-01-01'),
            role_id: adminRole._id
        });
        adminToken = generateToken(adminUser);
    });

    afterAll(async () => {
        await dbDisconnect();
    });

    afterEach(async () => {
        // Clear any additional users created in tests
        await User.deleteMany({ _id: { $nin: [testUser._id, adminUser._id] } });
    });

    describe('GET /api/users', () => {
        it('should get all users when authenticated as admin', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.code).toBe(200);
            expect(res.body.message).toBe('Users retrieved successfully');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(2); // At least our test users
        });

        it('should not allow non-admins to get all users', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/users/:id', () => {
        it('should get a user by ID when authenticated as that user', async () => {
            const res = await request(app)
                .get(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data._id.toString()).toBe(testUser._id.toString());
            expect(res.body.data.name).toBe(testUser.name);
            expect(res.body.data.email).toBe(testUser.email);
            // Password should not be returned
            expect(res.body.data.password).toBeUndefined();
        });

        it('should get any user by ID when authenticated as admin', async () => {
            const res = await request(app)
                .get(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data._id.toString()).toBe(testUser._id.toString());
        });

        it('should return 404 for non-existent user', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('User not found');
        });
    });

    describe('POST /api/users', () => {
        it('should create a new user when authenticated as admin', async () => {
            const newUser = {
                name: 'New Test User',
                email: 'newuser@example.com',
                password: 'password123',
                dateOfBirth: '1990-01-01',
                role_id: adminRole._id
            };

            const res = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.name).toBe(newUser.name);
            expect(res.body.data.email).toBe(newUser.email);
            expect(res.body.data.password).toBeUndefined(); // Password should not be returned
        });

        it('should not create a user with an existing email', async () => {
            const duplicateUser = {
                name: 'Duplicate User',
                email: testUser.email, // Using existing email
                password: 'password123',
                dateOfBirth: '1990-01-01',
                role_id: adminRole._id
            };

            const res = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(duplicateUser);

            expect(res.statusCode).toBe(409); // Conflict
            expect(res.body.message).toBe('Email already exists');
        });
    });

    describe('PUT /api/users/:id', () => {
        it('should update user when authenticated as that user', async () => {
            const updateData = {
                name: 'Updated Name',
                phoneNumber: '123-456-7890'
            };

            const res = await request(app)
                .put(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.name).toBe(updateData.name);
            expect(res.body.data.phoneNumber).toBe(updateData.phoneNumber);
        });

        it('should update any user when authenticated as admin', async () => {
            const updateData = {
                name: 'Admin Updated User',
                isEmailVerified: true
            };

            const res = await request(app)
                .put(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.name).toBe(updateData.name);
            expect(res.body.data.isEmailVerified).toBe(updateData.isEmailVerified);
        });

        it('should return 404 when trying to update non-existent user', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'New Name' });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('User not found');
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete user when authenticated as that user', async () => {
            // Create a user to delete
            const userToDelete = await User.create({
                name: 'User To Delete',
                email: 'delete@example.com',
                password: 'password123',
                dateOfBirth: new Date('1990-01-01'),
                role_id: adminRole._id
            });

            const deleteToken = generateToken(userToDelete);

            const res = await request(app)
                .delete(`/api/users/${userToDelete._id}`)
                .set('Authorization', `Bearer ${deleteToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('User removed successfully');

            // Verify the user was actually deleted
            const deletedUser = await User.findById(userToDelete._id);
            expect(deletedUser).toBeNull();
        });

        it('should delete any user when authenticated as admin', async () => {
            // Create a user to delete
            const userToDelete = await User.create({
                name: 'Another User To Delete',
                email: 'delete2@example.com',
                password: 'password123',
                dateOfBirth: new Date('1990-01-01'),
                role_id: adminRole._id
            });

            const res = await request(app)
                .delete(`/api/users/${userToDelete._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('User removed successfully');

            // Verify the user was actually deleted
            const deletedUser = await User.findById(userToDelete._id);
            expect(deletedUser).toBeNull();
        });

        it('should return 404 when trying to delete non-existent user', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('User not found');
        });
    });
}); 
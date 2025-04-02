const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const RolePermission = require('../models/rolePermissionModel');
const { PERMISSION_IDS } = require('../constants/permissions');

let mongoServer;

// Connect to the in-memory database
const dbConnect = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const mongooseOpts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    await mongoose.connect(uri, mongooseOpts);
};

// Disconnect and close connection
const dbDisconnect = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
};

// Clear all test data
const dbClear = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

// Create base permissions for testing
const createBasePermissions = async () => {
    const permissionsToCreate = [
        { _id: PERMISSION_IDS.READ_ALL_USERS, name: 'Read All Users', description: 'Can view all users in the system' },
        { _id: PERMISSION_IDS.EDIT_SINGLE_USER, name: 'Edit User', description: 'Can edit user profiles' },
        { _id: PERMISSION_IDS.CREATE_USER, name: 'Create User', description: 'Can create new users' },
        { _id: PERMISSION_IDS.DELETE_SINGLE_USER, name: 'Delete User', description: 'Can delete users' },
        { _id: PERMISSION_IDS.FETCH_SINGLE_USER, name: 'Fetch Single User', description: 'Can view specific user details' },
    ];

    const permissions = await Permission.insertMany(permissionsToCreate);
    return permissions;
};

// Create a test user with a specific role
const createTestUser = async (roleId) => {
    const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        dateOfBirth: new Date('1990-01-01'),
        role_id: roleId || mongoose.Types.ObjectId(), // Use provided role ID or generate new one
    });

    return user;
};

// Create roles with permissions
const createRoleWithPermissions = async (roleName, permissions) => {
    // Create the role
    const role = await Role.create({
        name: roleName,
        description: `${roleName} role for testing`,
        isActive: true
    });

    // Assign permissions to the role
    if (permissions && permissions.length > 0) {
        const rolePermissions = permissions.map(permissionId => ({
            role_id: role._id,
            permission_id: permissionId
        }));

        await RolePermission.insertMany(rolePermissions);
    }

    return role;
};

// Set up test environment with users, roles, and permissions
const setupTestEnvironment = async () => {
    // Create permissions
    const permissions = await createBasePermissions();

    // Create customer role (with minimal permissions)
    const customerRole = await createRoleWithPermissions('Customer', [
        PERMISSION_IDS.FETCH_SINGLE_USER
    ]);

    // Create admin role (with all permissions)
    const adminRole = await createRoleWithPermissions('Admin', [
        PERMISSION_IDS.READ_ALL_USERS,
        PERMISSION_IDS.EDIT_SINGLE_USER,
        PERMISSION_IDS.CREATE_USER,
        PERMISSION_IDS.DELETE_SINGLE_USER,
        PERMISSION_IDS.FETCH_SINGLE_USER
    ]);

    // Create a regular user
    const regularUser = await createTestUser(customerRole._id);

    // Create an admin user
    const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        dateOfBirth: new Date('1990-01-01'),
        role_id: adminRole._id
    });

    return {
        permissions,
        roles: {
            customer: customerRole,
            admin: adminRole
        },
        users: {
            regular: regularUser,
            admin: adminUser
        }
    };
};

// Generate a valid JWT token for a user
const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = {
    dbConnect,
    dbDisconnect,
    dbClear,
    createTestUser,
    createRoleWithPermissions,
    createBasePermissions,
    setupTestEnvironment,
    generateToken
}; 
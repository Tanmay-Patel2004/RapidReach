// Export as CommonJS module
const PERMISSIONS = {
  // User Management Permissions
  READ_ALL_USERS: {
    permission_id: 1,
    name: 'READ_ALL_USERS',
    title: 'Read All Users',
    description: 'Permission to view all users in the system',
    sectionName: 'User Management'
  },
  EDIT_SINGLE_USER: {
    permission_id: 2,
    name: 'EDIT_SINGLE_USER',
    title: 'Edit Single User',
    description: 'Permission to edit user details',
    sectionName: 'User Management'
  },
  ADD_SINGLE_USER: {
    permission_id: 3,
    name: 'ADD_SINGLE_USER',
    title: 'Add Single User',
    description: 'Permission to create new users',
    sectionName: 'User Management'
  },
  DELETE_SINGLE_USER: {
    permission_id: 4,
    name: 'DELETE_SINGLE_USER',
    title: 'Delete Single User',
    description: 'Permission to remove users from the system',
    sectionName: 'User Management'
  },
  FETCH_SINGLE_USER: {
    permission_id: 5,
    name: 'FETCH_SINGLE_USER',
    title: 'Fetch Single User',
    description: 'Permission to view details of a specific user',
    sectionName: 'User Management'
  }
};

// Simple array of permission IDs for quick validation
const PERMISSION_IDS = {
  // User Management
  READ_ALL_USERS: 1,
  EDIT_SINGLE_USER: 2,
  ADD_SINGLE_USER: 3,
  DELETE_SINGLE_USER: 4,
  FETCH_SINGLE_USER: 5
};

// Helper function to check if a user has a specific permission
const hasPermission = (userPermissions, requiredPermissionId) => {
  return userPermissions.some(permission => permission.id === requiredPermissionId);
};

// Helper function to check if a user has all required permissions
const hasAllPermissions = (userPermissions, requiredPermissionIds) => {
  return requiredPermissionIds.every(permissionId =>
    userPermissions.some(permission => permission.id === permissionId)
  );
};

// Helper function to check if a user has any of the required permissions
const hasAnyPermission = (userPermissions, requiredPermissionIds) => {
  return requiredPermissionIds.some(permissionId =>
    userPermissions.some(permission => permission.id === permissionId)
  );
};

// Export using CommonJS
module.exports = {
  PERMISSIONS,
  PERMISSION_IDS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission
};
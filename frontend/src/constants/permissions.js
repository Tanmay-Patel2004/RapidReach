/**
 * Permission Constants
 * These constants are used to validate user permissions for API calls
 * Each permission has a unique identifier (number)
 */

export const PERMISSIONS = {
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
  },

  // Permission Management
  READ_ALL_PERMISSIONS: {
    permission_id: 6,
    name: 'READ_ALL_PERMISSIONS',
    title: 'Read All Permissions',
    description: 'Permission to view all permissions in the system',
    sectionName: 'Permission Management'
  },
  EDIT_SINGLE_PERMISSION: {
    permission_id: 7,
    name: 'EDIT_SINGLE_PERMISSION',
    title: 'Edit Single Permission',
    description: 'Permission to edit permission details',
    sectionName: 'Permission Management'
  },
  ADD_SINGLE_PERMISSION: {
    permission_id: 8,
    name: 'ADD_SINGLE_PERMISSION',
    title: 'Add Single Permission',
    description: 'Permission to create new permissions',
    sectionName: 'Permission Management'
  },
  DELETE_SINGLE_PERMISSION: {
    permission_id: 9,
    name: 'DELETE_SINGLE_PERMISSION',
    title: 'Delete Single Permission',
    description: 'Permission to remove permissions from the system',
    sectionName: 'Permission Management'
  },
  FETCH_SINGLE_PERMISSION: {
    permission_id: 10,
    name: 'FETCH_SINGLE_PERMISSION',
    title: 'Fetch Single Permission',
    description: 'Permission to view details of a specific permission',
    sectionName: 'Permission Management'
  },

  // Role Management
  READ_ALL_ROLES: {
    permission_id: 11,
    name: 'READ_ALL_ROLES',
    title: 'Read All Roles',
    description: 'Permission to view all roles in the system',
    sectionName: 'Role Management'
  },
  EDIT_SINGLE_ROLE: {
    permission_id: 12,
    name: 'EDIT_SINGLE_ROLE',
    title: 'Edit Single Role',
    description: 'Permission to edit role details',
    sectionName: 'Role Management'
  },
  ADD_SINGLE_ROLE: {
    permission_id: 13,
    name: 'ADD_SINGLE_ROLE',
    title: 'Add Single Role',
    description: 'Permission to create new roles',
    sectionName: 'Role Management'
  },
  DELETE_SINGLE_ROLE: {
    permission_id: 14,
    name: 'DELETE_SINGLE_ROLE',
    title: 'Delete Single Role',
    description: 'Permission to remove roles from the system',
    sectionName: 'Role Management'
  },
  FETCH_SINGLE_ROLE: {
    permission_id: 15,
    name: 'FETCH_SINGLE_ROLE',
    title: 'Fetch Single Role',
    description: 'Permission to view details of a specific role',
    sectionName: 'Role Management'
  },

  // Role-Permission Management
  READ_ALL_ROLE_PERMISSIONS: {
    permission_id: 16,
    name: 'READ_ALL_ROLE_PERMISSIONS',
    title: 'Read All Role Permissions',
    description: 'Permission to view all role-permission mappings',
    sectionName: 'Role-Permission Management'
  },
  ASSIGN_PERMISSION_TO_ROLE: {
    permission_id: 17,
    name: 'ASSIGN_PERMISSION_TO_ROLE',
    title: 'Assign Permission to Role',
    description: 'Permission to assign permissions to roles',
    sectionName: 'Role-Permission Management'
  },
  REMOVE_PERMISSION_FROM_ROLE: {
    permission_id: 18,
    name: 'REMOVE_PERMISSION_FROM_ROLE',
    title: 'Remove Permission from Role',
    description: 'Permission to remove permissions from roles',
    sectionName: 'Role-Permission Management'
  },

  // Vendor Management
  READ_ALL_VENDORS: {
    permission_id: 19,
    name: 'READ_ALL_VENDORS',
    title: 'Read All Vendors',
    description: 'Permission to view all vendors in the system',
    sectionName: 'Vendor Management'
  },
  EDIT_SINGLE_VENDOR: {
    permission_id: 20,
    name: 'EDIT_SINGLE_VENDOR',
    title: 'Edit Single Vendor',
    description: 'Permission to edit vendor details',
    sectionName: 'Vendor Management'
  },
  ADD_SINGLE_VENDOR: {
    permission_id: 21,
    name: 'ADD_SINGLE_VENDOR',
    title: 'Add Single Vendor',
    description: 'Permission to create new vendors',
    sectionName: 'Vendor Management'
  },
  DELETE_SINGLE_VENDOR: {
    permission_id: 22,
    name: 'DELETE_SINGLE_VENDOR',
    title: 'Delete Single Vendor',
    description: 'Permission to remove vendors from the system',
    sectionName: 'Vendor Management'
  },
  FETCH_SINGLE_VENDOR: {
    permission_id: 23,
    name: 'FETCH_SINGLE_VENDOR',
    title: 'Fetch Single Vendor',
    description: 'Permission to view details of a specific vendor',
    sectionName: 'Vendor Management'
  },

  // Product Management
  READ_ALL_PRODUCTS: {
    permission_id: 24,
    name: 'READ_ALL_PRODUCTS',
    title: 'Read All Products',
    description: 'Permission to view all products in the system',
    sectionName: 'Product Management'
  },
  EDIT_SINGLE_PRODUCT: {
    permission_id: 25,
    name: 'EDIT_SINGLE_PRODUCT',
    title: 'Edit Single Product',
    description: 'Permission to edit product details',
    sectionName: 'Product Management'
  },
  ADD_SINGLE_PRODUCT: {
    permission_id: 26,
    name: 'ADD_SINGLE_PRODUCT',
    title: 'Add Single Product',
    description: 'Permission to create new products',
    sectionName: 'Product Management'
  },
  DELETE_SINGLE_PRODUCT: {
    permission_id: 27,
    name: 'DELETE_SINGLE_PRODUCT',
    title: 'Delete Single Product',
    description: 'Permission to remove products from the system',
    sectionName: 'Product Management'
  },
  FETCH_SINGLE_PRODUCT: {
    permission_id: 28,
    name: 'FETCH_SINGLE_PRODUCT',
    title: 'Fetch Single Product',
    description: 'Permission to view details of a specific product',
    sectionName: 'Product Management'
  }
};

// Simple array of permission IDs for quick validation
export const PERMISSION_IDS = {
  // User Management
  READ_ALL_USERS: 1,
  EDIT_SINGLE_USER: 2,
  ADD_SINGLE_USER: 3,
  DELETE_SINGLE_USER: 4,
  FETCH_SINGLE_USER: 5,

  // Permission Management
  READ_ALL_PERMISSIONS: 6,
  EDIT_SINGLE_PERMISSION: 7,
  ADD_SINGLE_PERMISSION: 8,
  DELETE_SINGLE_PERMISSION: 9,
  FETCH_SINGLE_PERMISSION: 10,

  // Role Management
  READ_ALL_ROLES: 11,
  EDIT_SINGLE_ROLE: 12,
  ADD_SINGLE_ROLE: 13,
  DELETE_SINGLE_ROLE: 14,
  FETCH_SINGLE_ROLE: 15,

  // Role-Permission Management
  READ_ALL_ROLE_PERMISSIONS: 16,
  ASSIGN_PERMISSION_TO_ROLE: 17,
  REMOVE_PERMISSION_FROM_ROLE: 18,

  // Vendor Management
  READ_ALL_VENDORS: 19,
  EDIT_SINGLE_VENDOR: 20,
  ADD_SINGLE_VENDOR: 21,
  DELETE_SINGLE_VENDOR: 22,
  FETCH_SINGLE_VENDOR: 23,

  // Product Management
  READ_ALL_PRODUCTS: 24,
  EDIT_SINGLE_PRODUCT: 25,
  ADD_SINGLE_PRODUCT: 26,
  DELETE_SINGLE_PRODUCT: 27,
  FETCH_SINGLE_PRODUCT: 28
};

// Helper function to check if a user has a specific permission
export const hasPermission = (userPermissions, requiredPermissionId) => {
  return userPermissions.some(permission => permission.permission_id === requiredPermissionId);
};

// Helper function to check if a user has all required permissions
export const hasAllPermissions = (userPermissions, requiredPermissionIds) => {
  return requiredPermissionIds.every(permissionId =>
    userPermissions.some(permission => permission.permission_id === permissionId)
  );
};

// Helper function to check if a user has any of the required permissions
export const hasAnyPermission = (userPermissions, requiredPermissionIds) => {
  return requiredPermissionIds.some(permissionId =>
    userPermissions.some(permission => permission.permission_id === permissionId)
  );
};

export default PERMISSIONS; 
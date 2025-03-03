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
  FETCH_SINGLE_USER: {
    permission_id: 5,
    name: 'FETCH_SINGLE_USER',
    title: 'Fetch Single User',
    description: 'Allows fetching details of a single user',
    sectionName: 'User Management'
  },
  EDIT_SINGLE_USER: {
    permission_id: 2,
    name: 'EDIT_SINGLE_USER',
    title: 'Edit Single User',
    description: 'Allows editing details of a single user',
    sectionName: 'User Management'
  },
  Add_SINGLE_USER: {
    permission_id: 3,
    name: 'Add_SINGLE_USER',
    title: 'Add Single User',
    description: 'Allows adding a new user to the system',
    sectionName: 'User Management'
  },
  DELETE_SINGLE_USER: {
    permission_id: 4,
    name: 'DELETE_SINGLE_USER',
    title: 'Delete Single User',
    description: 'Allows deletion of a single user',
    sectionName: 'User Management'
  },
  READ_ALL_PERMISSIONS: {
    permission_id: 6,
    name: 'READ_ALL_PERMISSIONS',
    title: 'Read All Permissions',
    description: 'Allows viewing of all permissions',
    sectionName: 'Permissions Management'
  },
  EDIT_SINGLE_PERMISSION: {
    permission_id: 7,
    name: 'EDIT_SINGLE_PERMISSION',
    title: 'Edit Single Permission',
    description: 'Allows editing a single permission',
    sectionName: 'Permissions Management'
  },
  ADD_SINGLE_PERMISSION: {
    permission_id: 8,
    name: 'ADD_SINGLE_PERMISSION',
    title: 'Add Single Permission',
    description: 'Allows adding a new permission',
    sectionName: 'Permissions Management'
  },
  DELETE_SINGLE_PERMISSION: {
    permission_id: 9,
    name: 'DELETE_SINGLE_PERMISSION',
    title: 'Delete Single Permission',
    description: 'Allows deletion of a single permission',
    sectionName: 'Permissions Management'
  },
  FETCH_SINGLE_PERMISSION: {
    permission_id: 10,
    name: 'FETCH_SINGLE_PERMISSION',
    title: 'Fetch Single Permission',
    description: 'Allows fetching details of a single permission',
    sectionName: 'Permissions Management'
  },
  READ_ALL_ROLES: {
    permission_id: 11,
    name: 'READ_ALL_ROLES',
    title: 'Read All Roles',
    description: 'Allows viewing of all roles',
    sectionName: 'Role Management'
  },
  EDIT_SINGLE_ROLE: {
    permission_id: 12,
    name: 'EDIT_SINGLE_ROLE',
    title: 'Edit Single Role',
    description: 'Allows editing a single role',
    sectionName: 'Role Management'
  },
  ADD_SINGLE_ROLE: {
    permission_id: 13,
    name: 'ADD_SINGLE_ROLE',
    title: 'Add Single Role',
    description: 'Allows adding a new role',
    sectionName: 'Role Management'
  },
  DELETE_SINGLE_ROLE: {
    permission_id: 14,
    name: 'DELETE_SINGLE_ROLE',
    title: 'Delete Single Role',
    description: 'Allows deletion of a single role',
    sectionName: 'Role Management'
  },
  FETCH_SINGLE_ROLE: {
    permission_id: 15,
    name: 'FETCH_SINGLE_ROLE',
    title: 'Fetch Single Role',
    description: 'Allows fetching details of a single role',
    sectionName: 'Role Management'
  },
  READ_ALL_ROLE_PERMISSIONS: {
    permission_id: 16,
    name: 'READ_ALL_ROLE_PERMISSIONS',
    title: 'Read All Role Permissions',
    description: 'Allows viewing of all role-permission mappings',
    sectionName: 'Role Permission Management'
  },
  ASSIGN_PERMISSION_TO_ROLE: {
    permission_id: 17,
    name: 'ASSIGN_PERMISSION_TO_ROLE',
    title: 'Assign Permission to Role',
    description: 'Allows assigning permissions to a role',
    sectionName: 'Role Permission Management'
  },
  REMOVE_PERMISSION_FROM_ROLE: {
    permission_id: 18,
    name: 'REMOVE_PERMISSION_FROM_ROLE',
    title: 'Remove Permission from Role',
    description: 'Allows removing permissions from a role',
    sectionName: 'Role Permission Management'
  },
  // Product Permissions
  READ_ALL_PRODUCTS: {
    permission_id: 19,
    name: 'READ_ALL_PRODUCTS',
    title: 'Read All Products',
    description: 'Allows viewing of all products in the system',
    sectionName: 'Product Management'
  },
  EDIT_SINGLE_PRODUCT: {
    permission_id: 20,
    name: 'EDIT_SINGLE_PRODUCT',
    title: 'Edit Single Product',
    description: 'Allows editing details of a single product',
    sectionName: 'Product Management'
  },
  ADD_SINGLE_PRODUCT: {
    permission_id: 21,
    name: 'ADD_SINGLE_PRODUCT',
    title: 'Add Single Product',
    description: 'Allows adding a new product to the system',
    sectionName: 'Product Management'
  },
  DELETE_SINGLE_PRODUCT: {
    permission_id: 22,
    name: 'DELETE_SINGLE_PRODUCT',
    title: 'Delete Single Product',
    description: 'Allows deletion of a single product',
    sectionName: 'Product Management'
  },
  FETCH_SINGLE_PRODUCT: {
    permission_id: 23,
    name: 'FETCH_SINGLE_PRODUCT',
    title: 'Fetch Single Product',
    description: 'Allows fetching details of a single product',
    sectionName: 'Product Management'
  },
  // Warehouse Permissions
  READ_ALL_WAREHOUSES: {
    permission_id: 24,
    name: 'READ_ALL_WAREHOUSES',
    title: 'Read All Warehouses',
    description: 'Allows viewing of all warehouse details',
    sectionName: 'Warehouse Management'
  },
  EDIT_SINGLE_WAREHOUSE: {
    permission_id: 25,
    name: 'EDIT_SINGLE_WAREHOUSE',
    title: 'Edit Single Warehouse',
    description: 'Allows editing details of a single warehouse',
    sectionName: 'Warehouse Management'
  },
  ADD_SINGLE_WAREHOUSE: {
    permission_id: 26,
    name: 'ADD_SINGLE_WAREHOUSE',
    title: 'Add Single Warehouse',
    description: 'Allows adding a new warehouse to the system',
    sectionName: 'Warehouse Management'
  },
  DELETE_SINGLE_WAREHOUSE: {
    permission_id: 27,
    name: 'DELETE_SINGLE_WAREHOUSE',
    title: 'Delete Single Warehouse',
    description: 'Allows deletion of a single warehouse',
    sectionName: 'Warehouse Management'
  },
  FETCH_SINGLE_WAREHOUSE: {
    permission_id: 28,
    name: 'FETCH_SINGLE_WAREHOUSE',
    title: 'Fetch Single Warehouse',
    description: 'Allows fetching details of a single warehouse',
    sectionName: 'Warehouse Management'
  },
  // Stock Permissions
  READ_WAREHOUSE_STOCK: {
    permission_id: 29,
    name: 'READ_WAREHOUSE_STOCK',
    title: 'Read Warehouse Stock',
    description: 'Allows viewing stock levels across all warehouses',
    sectionName: 'Stock Management'
  },
  UPDATE_WAREHOUSE_STOCK: {
    permission_id: 30,
    name: 'UPDATE_WAREHOUSE_STOCK',
    title: 'Update Warehouse Stock',
    description: 'Allows updating stock levels in a warehouse',
    sectionName: 'Stock Management'
  }
};

// Simple array of permission IDs for quick validation
const PERMISSION_IDS = {
  // User Management
  READ_ALL_USERS: 1,
  FETCH_SINGLE_USER: 5,
  EDIT_SINGLE_USER: 2,
  Add_SINGLE_USER: 3,
  DELETE_SINGLE_USER: 4,
  READ_ALL_PERMISSIONS: 6,
  EDIT_SINGLE_PERMISSION: 7,
  ADD_SINGLE_PERMISSION: 8,
  DELETE_SINGLE_PERMISSION: 9,
  FETCH_SINGLE_PERMISSION: 10,
  READ_ALL_ROLES: 11,
  EDIT_SINGLE_ROLE: 12,
  ADD_SINGLE_ROLE: 13,
  DELETE_SINGLE_ROLE: 14,
  FETCH_SINGLE_ROLE: 15,
  READ_ALL_ROLE_PERMISSIONS: 16,
  ASSIGN_PERMISSION_TO_ROLE: 17,
  REMOVE_PERMISSION_FROM_ROLE: 18,
  // Product Management
  READ_ALL_PRODUCTS: 19,
  EDIT_SINGLE_PRODUCT: 20,
  ADD_SINGLE_PRODUCT: 21,
  DELETE_SINGLE_PRODUCT: 22,
  FETCH_SINGLE_PRODUCT: 23,
  // Warehouse Management
  READ_ALL_WAREHOUSES: 24,
  EDIT_SINGLE_WAREHOUSE: 25,
  ADD_SINGLE_WAREHOUSE: 26,
  DELETE_SINGLE_WAREHOUSE: 27,
  FETCH_SINGLE_WAREHOUSE: 28,
  // Stock Management
  READ_WAREHOUSE_STOCK: 29,
  UPDATE_WAREHOUSE_STOCK: 30
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
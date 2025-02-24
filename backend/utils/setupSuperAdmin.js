const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const RolePermission = require('../models/rolePermissionModel');

const setupSuperAdminPermissions = async () => {
  try {
    // Find superadmin role
    const superadminRole = await Role.findOne({ name: 'superadmin' });
    if (!superadminRole) {
      console.error('❌ Superadmin role not found');
      return;
    }

    // Get all permissions
    const allPermissions = await Permission.find({});
    
    console.log('📝 Setting up permissions:', 
      allPermissions.map(p => ({
        id: p.permission_id,
        name: p.name
      }))
    );

    // Delete existing role-permission mappings for superadmin
    await RolePermission.deleteMany({ roleId: superadminRole._id });

    // Create new role-permission mappings
    const rolePermissions = allPermissions.map(permission => ({
      roleId: superadminRole._id,
      permissionId: permission._id
    }));

    const result = await RolePermission.insertMany(rolePermissions);
    
    console.log('✅ Superadmin permissions setup complete. Total permissions:', result.length);

    // Verify the setup
    const verifyPermissions = await RolePermission.find({ roleId: superadminRole._id })
      .populate('permissionId');
    
    console.log('🔍 Verification - Assigned permissions:', 
      verifyPermissions.map(rp => ({
        id: rp.permissionId.permission_id,
        name: rp.permissionId.name
      }))
    );

  } catch (error) {
    console.error('❌ Error setting up superadmin permissions:', error);
    throw error;
  }
};

module.exports = { setupSuperAdminPermissions }; 
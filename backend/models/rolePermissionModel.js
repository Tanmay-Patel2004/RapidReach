const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema({
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'Role ID is required']
  },
  permissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: [true, 'Permission ID is required']
  }
}, {
  timestamps: true
});

// Compound index to ensure unique role-permission combinations
rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

module.exports = mongoose.model('RolePermission', rolePermissionSchema); 
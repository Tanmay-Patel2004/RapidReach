const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  permission_id: {
    type: Number,
    required: [true, 'Permission ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Permission title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sectionName: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Permission', permissionSchema); 
const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  code: {
    type: String,
    required: [true, 'Product code is required'],
    unique: true,
    trim: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor ID is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware to update isAvailable based on quantity
productSchema.pre('save', function(next) {
  this.isAvailable = this.quantity > 0;
  next();
});

// Create index for product code
productSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema); 
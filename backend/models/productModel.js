const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit of measurement is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  warehouseCode: {
    type: String,
    required: [true, 'Warehouse code is required'],
    trim: true
  },
  images: [{
    type: String
  }],
  video: {
    type: String,
    default: null
  },
  specifications: [{
    key: {
      type: String,
      required: [true, 'Specification key is required'],
      trim: true
    },
    value: {
      type: String,
      required: [true, 'Specification value is required'],
      trim: true
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create text index for search
productSchema.index({ name: 'text', description: 'text' });

// Create indexes for filtering and sorting
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Create virtual for warehouse details
productSchema.virtual('warehouse', {
  ref: 'Warehouse',
  localField: 'warehouseCode',
  foreignField: 'warehouseCode',
  justOne: true
});

// Create indexes for better query performance
// productSchema.index({ name: 1 });
// productSchema.index({ sku: 1 }, { unique: true });
// productSchema.index({ warehouseCode: 1 });

// Remove any existing indexes that might be causing the error
productSchema.on('index', function (err) {
  if (err) {
    console.error('Index Error:', err);
  }
});

// Middleware to validate warehouse exists before saving
productSchema.pre('save', async function (next) {
  if (this.isModified('warehouseCode')) {
    const Warehouse = mongoose.model('Warehouse');
    const warehouse = await Warehouse.findOne({ warehouseCode: this.warehouseCode });
    if (!warehouse) {
      throw new Error('Invalid warehouse code');
    }
  }
  next();
});

productSchema.methods.isStockSufficient = function (quantity) {
  return this.stockQuantity >= quantity;
};

module.exports = mongoose.model('Product', productSchema);
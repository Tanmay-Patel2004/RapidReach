const Product = require('../models/productModel');
const Vendor = require('../models/vendorModel');
const mongoose = require('mongoose');

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, vendorId, category } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      quantity,
      vendorId,
      category,
      isAvailable: quantity > 0
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('vendorId', 'name email');
    res.json(products);
  } catch (error) {
    console.error('❌ Get All Products Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendorId', 'name email address phoneNumber');
    
    if (!product) {
      return res.status(404).json({ message: '❌ Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('❌ Get Product Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category, isActive } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '❌ Product not found' });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.quantity = quantity !== undefined ? quantity : product.quantity;
    product.category = category || product.category;
    product.isActive = isActive !== undefined ? isActive : product.isActive;
    // isAvailable will be automatically updated by the pre-save middleware

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '❌ Product not found' });
    }

    await product.deleteOne();
    res.json({ message: '✅ Product removed successfully' });
  } catch (error) {
    console.error('❌ Delete Product Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products by vendor
// @route   GET /api/products/vendor/:vendorId
// @access  Private
const getProductsByVendor = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.params.vendorId })
      .populate('vendorId', 'name email');
    res.json(products);
  } catch (error) {
    console.error('❌ Get Vendor Products Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByVendor
}; 
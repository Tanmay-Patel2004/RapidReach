const Product = require('../models/productModel');
const Warehouse = require('../models/warehouseModel');
const uploadToS3 = require('../utils/s3Upload');
const { getHandlerResponse } = require('../middleware/responseMiddleware');
const httpStatus = require('../Helper/http_status');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getAllProducts = async (req, res) => {
  try {
    console.log('📝 Getting all products...');

    // Build query
    let query = {};

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Status filter (optional)
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Get all unique categories
    const categories = await Product.distinct('category');

    // Execute query with optional sorting
    let products;
    if (req.query.sort === 'category') {
      products = await Product.find(query)
        .populate('warehouse')
        .sort({ category: 1 });
    } else {
      products = await Product.find(query)
        .populate('warehouse');
    }

    console.log(`✅ Found ${products.length} products`);

    const responseData = {
      categories,
      count: products.length,
      products
    };

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Products retrieved successfully', responseData);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get All Products Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('warehouse');
    if (!product) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Product not found', null);
      return res.status(code).json({ code, message, data });
    }
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Product retrieved successfully', product);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get Product Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      sku,
      stockQuantity,
      unit,
      status,
      warehouseCode,
      specifications
    } = req.body;

    // Check if product with this SKU already exists
    const productExists = await Product.findOne({ sku });
    if (productExists) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Product with this SKU already exists', null);
      return res.status(code).json({ code, message, data });
    }

    // Verify warehouse exists
    const warehouse = await Warehouse.findOne({ warehouseCode });
    if (!warehouse) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Invalid warehouse code', null);
      return res.status(code).json({ code, message, data });
    }

    // Handle multiple image uploads
    let imageUrls = [];
    if (req.files && req.files.images) {
      try {
        console.log(`📁 Received ${req.files.images.length} images`);
        const uploadPromises = req.files.images.map(file => uploadToS3(file, 'products/images'));
        imageUrls = await Promise.all(uploadPromises);
        console.log('✅ Successfully uploaded images:', imageUrls);
      } catch (uploadError) {
        console.error('❌ Image Upload Error:', uploadError);
        const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Error uploading product images', uploadError);
        return res.status(code).json({ code, message, data });
      }
    }

    // Handle video upload
    let videoUrl = null;
    if (req.files && req.files.video && req.files.video.length > 0) {
      try {
        console.log('📹 Received video file');
        videoUrl = await uploadToS3(req.files.video[0], 'products/videos');
        console.log('✅ Successfully uploaded video:', videoUrl);
      } catch (uploadError) {
        console.error('❌ Video Upload Error:', uploadError);
        const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Error uploading product video', uploadError);
        return res.status(code).json({ code, message, data });
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      sku,
      stockQuantity,
      unit,
      status,
      warehouseCode,
      images: imageUrls,
      video: videoUrl,
      specifications: specifications || []
    });

    const populatedProduct = await Product.findById(product._id).populate('warehouse');
    const { code, message, data } = getHandlerResponse(true, httpStatus.CREATED, 'Product created successfully', populatedProduct);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Create Product Error:', error);
    const statusCode = error.name === 'ValidationError' ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const { code, message, data } = getHandlerResponse(false, statusCode, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      sku,
      stockQuantity,
      unit,
      status,
      warehouseCode,
      specifications
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '❌ Product not found' });
    }

    // If SKU is being changed, check if new SKU already exists
    if (sku && sku !== product.sku) {
      const skuExists = await Product.findOne({ sku });
      if (skuExists) {
        return res.status(400).json({ message: '❌ Product with this SKU already exists' });
      }
    }

    // If warehouse code is being changed, verify new warehouse exists
    if (warehouseCode && warehouseCode !== product.warehouseCode) {
      const warehouse = await Warehouse.findOne({ warehouseCode });
      if (!warehouse) {
        return res.status(400).json({ message: '❌ Invalid warehouse code' });
      }
    }

    // Handle multiple image uploads for update
    let imageUrls = product.images;
    if (req.files && req.files.images) {
      try {
        console.log(`📁 Received ${req.files.images.length} new images`);
        const uploadPromises = req.files.images.map(file => uploadToS3(file, 'products/images'));
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
        console.log('✅ Successfully uploaded new images:', newImageUrls);
      } catch (uploadError) {
        console.error('❌ Image Upload Error:', uploadError);
        return res.status(400).json({
          message: 'Error uploading product images',
          details: uploadError.message
        });
      }
    }

    // Handle video upload for update
    let videoUrl = product.video;
    if (req.files && req.files.video && req.files.video.length > 0) {
      try {
        console.log('📹 Received new video file');
        videoUrl = await uploadToS3(req.files.video[0], 'products/videos');
        console.log('✅ Successfully uploaded new video:', videoUrl);
      } catch (uploadError) {
        console.error('❌ Video Upload Error:', uploadError);
        return res.status(400).json({
          message: 'Error uploading product video',
          details: uploadError.message
        });
      }
    }

    // Update fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.sku = sku || product.sku;
    product.stockQuantity = stockQuantity || product.stockQuantity;
    product.unit = unit || product.unit;
    product.status = status || product.status;
    product.warehouseCode = warehouseCode || product.warehouseCode;
    product.images = imageUrls;
    product.video = videoUrl;
    // Update specifications if provided
    if (specifications) {
      product.specifications = specifications;
    }

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(updatedProduct._id).populate('warehouse');
    res.json(populatedProduct);
  } catch (error) {
    console.error('❌ Update Product Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageUrl
// @access  Private
const deleteProductImage = async (req, res) => {
  try {
    const { id, imageUrl } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: '❌ Product not found' });
    }

    // Remove the image URL from the images array
    product.images = product.images.filter(img => img !== decodeURIComponent(imageUrl));
    await product.save();

    res.json({ message: '✅ Image removed successfully', product });
  } catch (error) {
    console.error('❌ Delete Image Error:', error);
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

// @desc    Get products by warehouse
// @route   GET /api/products/warehouse/:warehouseCode
// @access  Private
const getProductsByWarehouse = async (req, res) => {
  try {
    const { warehouseCode } = req.params;
    const products = await Product.find({ warehouseCode }).populate('warehouse');
    res.json(products);
  } catch (error) {
    console.error('❌ Get Products by Warehouse Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product video
// @route   DELETE /api/products/:id/video
// @access  Private
const deleteProductVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: '❌ Product not found' });
    }

    // Remove the video URL
    product.video = null;
    await product.save();

    res.json({ message: '✅ Video removed successfully', product });
  } catch (error) {
    console.error('❌ Delete Video Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Private
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category })
      .populate('warehouse')
      .sort({ name: 1 }); // Sort by name within category

    res.json({
      category,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('❌ Get Products by Category Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product stock
// @route   PUT /api/products/update-stock
// @access  Private
const updateProductStock = async (req, res) => {
  try {
    const { items } = req.body;

    // Update each product's stock
    const updatePromises = items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Decrease the stock quantity
      product.stockQuantity -= item.quantity;
      
      // Validate stock doesn't go negative
      if (product.stockQuantity < 0) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      return product.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      code: 200,
      message: 'Product stock updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  deleteProductVideo,
  getProductsByWarehouse,
  getProductsByCategory,
  updateProductStock
}; 
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadProductFiles } = require('../middleware/uploadMiddleware');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  deleteProductVideo,
  getProductsByWarehouse,
  getProductsByCategory
} = require('../controllers/productController');

// All routes are protected
router.use(protect);

// /api/products
router.route('/')
  .get(getAllProducts)
  .post(uploadProductFiles, createProduct);

// /api/products/category/:category
router.route('/category/:category')
  .get(getProductsByCategory);

// /api/products/warehouse/:warehouseCode
router.route('/warehouse/:warehouseCode')
  .get(getProductsByWarehouse);

// /api/products/:id
router.route('/:id')
  .get(getProductById)
  .put(uploadProductFiles, updateProduct)
  .delete(deleteProduct);

// /api/products/:id/images/:imageUrl
router.route('/:id/images/:imageUrl')
  .delete(deleteProductImage);

// /api/products/:id/video
router.route('/:id/video')
  .delete(deleteProductVideo);

module.exports = router; 
const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByVendor
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const { PERMISSION_IDS } = require('../constants/permissions');

// All routes are protected
router.use(protect);

router.route('/')
  .post(checkPermission(PERMISSION_IDS.ADD_SINGLE_PRODUCT), createProduct)
  .get(checkPermission(PERMISSION_IDS.READ_ALL_PRODUCTS), getAllProducts);

router.route('/:id')
  .get(checkPermission(PERMISSION_IDS.FETCH_SINGLE_PRODUCT), getProductById)
  .put(checkPermission(PERMISSION_IDS.EDIT_SINGLE_PRODUCT), updateProduct)
  .delete(checkPermission(PERMISSION_IDS.DELETE_SINGLE_PRODUCT), deleteProduct);

router.route('/vendor/:vendorId')
  .get(checkPermission(PERMISSION_IDS.READ_ALL_PRODUCTS), getProductsByVendor);

module.exports = router; 
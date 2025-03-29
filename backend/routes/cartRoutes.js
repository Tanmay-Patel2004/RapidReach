const express = require('express');
const { 
  addToCart, 
  updateCartItem, 
  removeCartItem, 
  listCartItems,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/', protect, addToCart);
router.get('/', protect, listCartItems);
router.put('/update', protect, updateCartItem);
router.delete('/remove', protect, removeCartItem);
router.delete('/clear', protect, clearCart);

module.exports = router;

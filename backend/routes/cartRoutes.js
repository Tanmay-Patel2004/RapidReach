const express = require('express');
const { addToCart, listCartItems } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, addToCart);
router.get('/', protect, listCartItems);

module.exports = router;

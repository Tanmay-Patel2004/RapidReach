const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const { getHandlerResponse } = require('../middleware/responseMiddleware');
const httpStatus = require('../Helper/http_status');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Product not found', null);
      return res.status(code).json({ code, message, data });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Item added to cart', cart);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Add to Cart Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    List all cart items
// @route   GET /api/cart
// @access  Private
const listCartItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Cart not found', null);
      return res.status(code).json({ code, message, data });
    }

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Cart items retrieved successfully', cart);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ List Cart Items Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

module.exports = {
  addToCart,
  listCartItems
};

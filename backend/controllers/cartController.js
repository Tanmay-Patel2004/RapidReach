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
    const user = req.user._id;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Product not found', null);
      return res.status(code).json({ code, message, data });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user });
    if (!cart) {
      cart = await Cart.create({ user, items: [] });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    await cart.populate('items.productId');
    
    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Item added to cart', cart);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Add to Cart Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = req.user._id;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Product not found', null);
      return res.status(code).json({ code, message, data });
    }

    // Check if quantity is valid
    if (quantity < 1) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'Quantity must be at least 1', null);
      return res.status(code).json({ code, message, data });
    }

    // Update cart
    const cart = await Cart.findOne({ user });
    if (!cart) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Cart not found', null);
      return res.status(code).json({ code, message, data });
    }

    const cartItem = cart.items.find(item => item.productId.toString() === productId);
    if (!cartItem) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Item not found in cart', null);
      return res.status(code).json({ code, message, data });
    }

    cartItem.quantity = quantity;
    await cart.save();
    await cart.populate('items.productId');

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Cart item updated', cart);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Update Cart Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user._id;

    const cart = await Cart.findOne({ user });
    if (!cart) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Cart not found', null);
      return res.status(code).json({ code, message, data });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    await cart.populate('items.productId');

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Item removed from cart', cart);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Remove Cart Item Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    List all cart items
// @route   GET /api/cart
// @access  Private
const listCartItems = async (req, res) => {
  try {
    const user = req.user._id;
    let cart = await Cart.findOne({ user }).populate('items.productId');
    
    if (!cart) {
      // If no cart exists, create an empty one
      cart = await Cart.create({ user, items: [] });
    }

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Cart items retrieved successfully', cart);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ List Cart Items Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const user = req.user._id;

    // Find and remove all items from cart
    const cart = await Cart.findOne({ user });
    if (!cart) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Cart not found', null);
      return res.status(code).json({ code, message, data });
    }

    // Clear the items array
    cart.items = [];
    await cart.save();

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Cart cleared successfully', cart);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Clear Cart Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

module.exports = {
  addToCart,
  updateCartItem,
  removeCartItem,
  listCartItems,
  clearCart
};

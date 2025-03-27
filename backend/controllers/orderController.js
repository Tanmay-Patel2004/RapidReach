const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel'); // Assuming a Cart model exists
const { getHandlerResponse } = require('../middleware/responseMiddleware');
const httpStatus = require('../Helper/http_status');

// @desc    Checkout and place an order
// @route   POST /api/orders/checkout
// @access  Private
const checkout = async (req, res) => {
  try {
    const { products, address, email, phone, customerName, totalAmount } = req.body;
    const userId = req.user._id;

    if (!products || products.length === 0) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, 'At least one product is required', null);
      return res.status(code).json({ code, message, data });
    }

    // Check product stock
    for (const product of products) {
      const productData = await Product.findById(product.productId);
      if (!productData) {
        const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, `Product with ID ${product.productId} not found`, null);
        return res.status(code).json({ code, message, data });
      }
      if (productData.stockQuantity < product.quantity) {
        const { code, message, data } = getHandlerResponse(false, httpStatus.BAD_REQUEST, `Insufficient stock for product: ${productData.name}`, null);
        return res.status(code).json({ code, message, data });
      }
    }

    // Create the order
    const order = await Order.create({
      user: userId,
      customerName,
      items: products.map(product => ({
        productId: product.productId,
        name: product.name,
        quantity: product.quantity,
        price: product.price
      })),
      address,
      email,
      phone,
      totalAmount
    });

    // Deduct product quantities
    for (const product of products) {
      await Product.findByIdAndUpdate(product.productId, {
        $inc: { stockQuantity: -product.quantity }
      });
    }

    // Clear the user's cart
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    const { code, message, data } = getHandlerResponse(true, httpStatus.CREATED, 'Order placed successfully', order);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Checkout Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedDrivers } = req.body; // Added assignedDrivers to request body

    const order = await Order.findById(id);
    if (!order) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Order not found', null);
      return res.status(code).json({ code, message, data });
    }

    order.status = status;

    // Update assigned drivers if provided
    if (assignedDrivers) {
      order.assignedDrivers = assignedDrivers; // Replace or update assigned drivers
    }

    await order.save();

    const { code, message, data } = getHandlerResponse(true, httpStatus.OK, 'Order status updated successfully', order);
    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Update Order Status Error:', error);
    const { code, message, data } = getHandlerResponse(false, httpStatus.INTERNAL_SERVER_ERROR, error.message, null);
    return res.status(code).json({ code, message, data });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find(); // Assuming Order is your order model
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

module.exports = {
  checkout,
  updateOrderStatus,
  getAllOrders,
};

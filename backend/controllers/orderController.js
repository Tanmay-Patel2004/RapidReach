const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel'); // Assuming a Cart model exists
const Driver = require('../models/driverModel'); // Import Driver model
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
    const { status, assignedDrivers } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'Order not found', null);
      return res.status(code).json({ code, message, data });
    }

    order.status = status;

    // Assign the order to the most active idle driver if status is "Ready for Pickup"
    if (status === 'Ready for Pickup') {
      const idleDriver = await Driver.findOne({ status: 'Idle' })
        .sort({ activeTime: -1 }) // Sort by highest active time
        .exec();

      if (idleDriver) {
        // Assign the driver to the order
        order.assignedDrivers = [
          {
            driverId: idleDriver.user,
            deliveryStatus: 'Pending',
            deliveryTime: null
          }
        ];

        // Update the driver's status to "Assigned"
        idleDriver.status = 'Assigned';
        await idleDriver.save();
      } else {
        const { code, message, data } = getHandlerResponse(false, httpStatus.NOT_FOUND, 'No idle drivers available', null);
        return res.status(code).json({ code, message, data });
      }
    }

    // Update assigned drivers if provided
    if (assignedDrivers) {
      order.assignedDrivers = assignedDrivers;
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

// @desc    Get monthly order report
// @route   GET /api/orders/report
// @access  Private
const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validate input
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (!month || !year || isNaN(monthNum) || isNaN(yearNum) ||
      monthNum < 1 || monthNum > 12 || yearNum < 2000 || yearNum > 2100) {
      const { code, message, data } = getHandlerResponse(
        false,
        httpStatus.BAD_REQUEST,
        'Invalid month or year. Month should be 1-12 and year should be between 2000-2100',
        null
      );
      return res.status(code).json({ code, message, data });
    }

    // Create date range for the specified month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // Fetch orders for the specified month
    const orders = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).select('_id createdAt customerName totalAmount status');

    // Calculate totals
    const totalAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;

    // Format orders for response
    const formattedOrders = orders.map(order => ({
      orderId: order._id,
      date: order.createdAt,
      customer: order.customerName,
      amount: order.totalAmount,
      status: order.status
    }));

    // Prepare report
    const report = {
      month: monthNum,
      year: yearNum,
      totalOrders,
      totalAmount,
      orders: formattedOrders
    };

    const { code, message, data } = getHandlerResponse(
      true,
      httpStatus.OK,
      'Monthly report generated successfully',
      report
    );
    return res.status(code).json({ code, message, data });

  } catch (error) {
    console.error('❌ Monthly Report Error:', error);
    const { code, message, data } = getHandlerResponse(
      false,
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message,
      null
    );
    return res.status(code).json({ code, message, data });
  }
};

module.exports = {
  checkout,
  updateOrderStatus,
  getAllOrders,
  getMonthlyReport,
};

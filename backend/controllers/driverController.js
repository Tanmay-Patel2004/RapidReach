const Driver = require('../models/driverModel');
const Order = require('../models/orderModel');
const { getHandlerResponse } = require('../middleware/responseMiddleware');
const httpStatus = require('../Helper/http_status');

// @desc    Update driver active time
// @route   POST /api/drivers/update-active-time
// @access  Private
const updateDriverActiveTime = async (req, res) => {
  try {
    const { driverId, activeTime } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Update active time only if the driver is idle
    if (driver.status === 'Idle') {
      driver.activeTime += activeTime;
      driver.lastUpdated = new Date();
      await driver.save();
    }

    res.status(200).json({ message: 'Driver active time updated successfully', driver });
  } catch (error) {
    console.error('❌ Update Driver Active Time Error:', error);
    res.status(500).json({ message: 'Failed to update driver active time', error: error.message });
  }
};




// @desc    Get orders available for pickup
// @route   GET /api/drivers/available-orders
// @access  Private (Driver)
const getAvailableOrders = async (req, res) => {
  try {
    // Find all orders with status "Ready for Pickup" and not yet assigned to any driver
    const availableOrders = await Order.find({
      status: 'Ready for Pickup',
      $or: [
        { assignedDrivers: { $size: 0 } },
        { assignedDrivers: { $exists: false } }
      ]
    }).select('_id customerName address items totalAmount tax subtotal createdAt status');

    // Add tax and subtotal fields if they're missing
    const processedOrders = availableOrders.map(order => {
      const orderObj = order.toObject();

      // Handle missing tax and subtotal fields for older orders
      if (!orderObj.tax || !orderObj.subtotal) {
        // Calculate default values based on totalAmount
        // Assuming 13% tax rate as previously implemented
        if (!orderObj.subtotal) {
          // If subtotal is missing, assume totalAmount is the subtotal + tax
          // So to get subtotal: totalAmount / 1.13
          orderObj.subtotal = orderObj.totalAmount / 1.13;
        }

        if (!orderObj.tax) {
          // If tax is missing, calculate it from subtotal or totalAmount
          if (orderObj.subtotal) {
            orderObj.tax = orderObj.subtotal * 0.13;
          } else {
            // Fallback calculation if something goes wrong
            orderObj.tax = orderObj.totalAmount * 0.13 / 1.13;
          }
        }

        // Set taxRate if it doesn't exist
        if (!orderObj.taxRate) {
          orderObj.taxRate = 0.13;
        }
      }

      return orderObj;
    });

    const { code, message, data } = getHandlerResponse(
      true,
      httpStatus.OK,
      'Available orders retrieved successfully',
      processedOrders
    );

    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get Available Orders Error:', error);
    const { code, message, data } = getHandlerResponse(
      false,
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message,
      null
    );

    return res.status(code).json({ code, message, data });
  }
};

// @desc    Claim an order for delivery
// @route   POST /api/drivers/claim-order/:orderId
// @access  Private (Driver)
const claimOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const driverId = req.user._id; // Get the driver ID from the authenticated user

    console.log(`Claim order attempt by user ${driverId} for order ${orderId}`);

    // Find the driver
    let driver = await Driver.findOne({ user: driverId });

    // If no driver record exists yet but user has driver role, create one
    if (!driver && (
      (req.user.role_id && req.user.role_id.name &&
        (req.user.role_id.name.toLowerCase() === 'driver' ||
          req.user.role_id.name.toLowerCase() === 'super admin' ||
          req.user.role_id.name.toLowerCase() === 'superadmin' ||
          req.user.role_id.name.toLowerCase() === 'admin')
      )
    )) {
      console.log(`Creating new driver record for user ${driverId}`);
      driver = await Driver.create({
        user: driverId,
        status: 'Idle',
        activeTime: 0,
        lastUpdated: new Date()
      });
    }

    if (!driver) {
      console.log(`No driver record found for user ${driverId}`);
      const { code, message, data } = getHandlerResponse(
        false,
        httpStatus.NOT_FOUND,
        'Driver not found',
        null
      );

      return res.status(code).json({ code, message, data });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      const { code, message, data } = getHandlerResponse(
        false,
        httpStatus.NOT_FOUND,
        'Order not found',
        null
      );

      return res.status(code).json({ code, message, data });
    }

    // Check if order is available for pickup
    if (order.status !== 'Ready for Pickup') {
      const { code, message, data } = getHandlerResponse(
        false,
        httpStatus.BAD_REQUEST,
        'Order is not available for pickup',
        null
      );

      return res.status(code).json({ code, message, data });
    }

    // Check if the order is already claimed by any driver
    if (order.assignedDrivers && order.assignedDrivers.length > 0) {
      const { code, message, data } = getHandlerResponse(
        false,
        httpStatus.BAD_REQUEST,
        'Order has already been claimed by another driver',
        null
      );

      return res.status(code).json({ code, message, data });
    }

    // Handle missing tax and subtotal fields for older orders
    if (!order.tax || !order.subtotal) {
      // Calculate default values based on totalAmount
      // Assuming 13% tax rate as previously implemented
      if (!order.subtotal) {
        // If subtotal is missing, assume totalAmount is the subtotal + tax
        // So to get subtotal: totalAmount / 1.13
        order.subtotal = order.totalAmount / 1.13;
      }

      if (!order.tax) {
        // If tax is missing, calculate it from subtotal or totalAmount
        if (order.subtotal) {
          order.tax = order.subtotal * 0.13;
        } else {
          // Fallback calculation if something goes wrong
          order.tax = order.totalAmount * 0.13 / 1.13;
        }
      }

      // Set taxRate if it doesn't exist
      if (!order.taxRate) {
        order.taxRate = 0.13;
      }

      console.log(`Added missing tax fields to order ${orderId}. Subtotal: ${order.subtotal}, Tax: ${order.tax}`);
    }

    // Update the order with the driver assignment
    order.assignedDrivers = [{
      driverId: driverId,
      deliveryStatus: 'Out for Delivery',
      deliveryTime: null
    }];

    // Update order status to "Out for Delivery"
    order.status = 'Out for Delivery';

    await order.save();

    // Update driver status to "Assigned"
    driver.status = 'Assigned';
    await driver.save();

    console.log(`Order ${orderId} claimed successfully by user ${driverId}`);

    const { code, message, data } = getHandlerResponse(
      true,
      httpStatus.OK,
      'Order claimed successfully',
      order
    );

    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Claim Order Error:', error);
    const { code, message, data } = getHandlerResponse(
      false,
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message,
      null
    );

    return res.status(code).json({ code, message, data });
  }
};

// @desc    Update order delivery status
// @route   PATCH /api/drivers/update-delivery/:orderId
// @access  Private (Driver)
const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus, notes } = req.body;
    const driverId = req.user._id; // Get the driver ID from the authenticated user

    console.log(`Update delivery status attempt by user ${driverId} for order ${orderId}`);

    // Validate delivery status
    if (!['Out for Delivery', 'Delivered', 'Not Delivered'].includes(deliveryStatus)) {
      const { code, message, data } = getHandlerResponse(
        false,
        httpStatus.BAD_REQUEST,
        'Invalid delivery status. Must be "Out for Delivery", "Delivered", or "Not Delivered"',
        null
      );

      return res.status(code).json({ code, message, data });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      const { code, message, data } = getHandlerResponse(
        false,
        httpStatus.NOT_FOUND,
        'Order not found',
        null
      );

      return res.status(code).json({ code, message, data });
    }

    // Check if the driver is assigned to this order
    const driverAssignment = order.assignedDrivers.find(
      assignment => assignment.driverId.toString() === driverId.toString()
    );

    if (!driverAssignment) {
      const { code, message, data } = getHandlerResponse(
        false,
        httpStatus.FORBIDDEN,
        'You are not assigned to this order',
        null
      );

      return res.status(code).json({ code, message, data });
    }

    // Handle missing tax and subtotal fields for older orders
    if (!order.tax || !order.subtotal) {
      // Calculate default values based on totalAmount
      // Assuming 13% tax rate as previously implemented
      if (!order.subtotal) {
        // If subtotal is missing, assume totalAmount is the subtotal + tax
        // So to get subtotal: totalAmount / 1.13
        order.subtotal = order.totalAmount / 1.13;
      }

      if (!order.tax) {
        // If tax is missing, calculate it from subtotal or totalAmount
        if (order.subtotal) {
          order.tax = order.subtotal * 0.13;
        } else {
          // Fallback calculation if something goes wrong
          order.tax = order.totalAmount * 0.13 / 1.13;
        }
      }

      // Set taxRate if it doesn't exist
      if (!order.taxRate) {
        order.taxRate = 0.13;
      }

      console.log(`Added missing tax fields to order ${orderId}. Subtotal: ${order.subtotal}, Tax: ${order.tax}`);
    }

    // Update the driver assignment status
    driverAssignment.deliveryStatus = deliveryStatus;
    driverAssignment.deliveryTime = new Date();
    driverAssignment.notes = notes || '';

    // Update the overall order status based on delivery status
    if (deliveryStatus === 'Delivered') {
      order.status = 'Delivered';
    } else if (deliveryStatus === 'Not Delivered') {
      order.status = 'Failed Delivery';
    } else if (deliveryStatus === 'Out for Delivery') {
      order.status = 'Out for Delivery';
    }

    await order.save();

    // If delivery is complete (either delivered or not), update driver status to idle
    if (deliveryStatus === 'Delivered' || deliveryStatus === 'Not Delivered') {
      let driver = await Driver.findOne({ user: driverId });

      // Create driver record if it doesn't exist
      if (!driver && (
        (req.user.role_id && req.user.role_id.name &&
          (req.user.role_id.name.toLowerCase() === 'driver' ||
            req.user.role_id.name.toLowerCase() === 'super admin' ||
            req.user.role_id.name.toLowerCase() === 'superadmin' ||
            req.user.role_id.name.toLowerCase() === 'admin')
        )
      )) {
        console.log(`Creating new driver record for user ${driverId}`);
        driver = await Driver.create({
          user: driverId,
          status: 'Idle',
          activeTime: 0,
          lastUpdated: new Date()
        });
      }

      if (driver) {
        driver.status = 'Idle';
        await driver.save();
      }
    }

    console.log(`Order ${orderId} status updated to ${deliveryStatus} by user ${driverId}`);

    const { code, message, data } = getHandlerResponse(
      true,
      httpStatus.OK,
      `Order marked as ${deliveryStatus} successfully`,
      order
    );

    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Update Delivery Status Error:', error);
    const { code, message, data } = getHandlerResponse(
      false,
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message,
      null
    );

    return res.status(code).json({ code, message, data });
  }
};

// @desc    Get a driver's assigned orders
// @route   GET /api/drivers/my-orders
// @access  Private (Driver)
const getDriverOrders = async (req, res) => {
  try {
    const driverId = req.user._id; // Get the driver ID from the authenticated user

    // Find all orders assigned to this driver
    const orders = await Order.find({
      'assignedDrivers.driverId': driverId
    }).sort({ createdAt: -1 });

    // Process orders to ensure tax and subtotal fields exist
    const processedOrders = orders.map(order => {
      const orderObj = order.toObject();

      // Handle missing tax and subtotal fields for older orders
      if (!orderObj.tax || !orderObj.subtotal) {
        // Calculate default values based on totalAmount
        // Assuming 13% tax rate as previously implemented
        if (!orderObj.subtotal) {
          // If subtotal is missing, assume totalAmount is the subtotal + tax
          // So to get subtotal: totalAmount / 1.13
          orderObj.subtotal = orderObj.totalAmount / 1.13;
        }

        if (!orderObj.tax) {
          // If tax is missing, calculate it from subtotal or totalAmount
          if (orderObj.subtotal) {
            orderObj.tax = orderObj.subtotal * 0.13;
          } else {
            // Fallback calculation if something goes wrong
            orderObj.tax = orderObj.totalAmount * 0.13 / 1.13;
          }
        }

        // Set taxRate if it doesn't exist
        if (!orderObj.taxRate) {
          orderObj.taxRate = 0.13;
        }
      }

      return orderObj;
    });

    const { code, message, data } = getHandlerResponse(
      true,
      httpStatus.OK,
      'Driver orders retrieved successfully',
      processedOrders
    );

    return res.status(code).json({ code, message, data });
  } catch (error) {
    console.error('❌ Get Driver Orders Error:', error);
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
  updateDriverActiveTime,
  getAvailableOrders,
  claimOrder,
  updateDeliveryStatus,
  getDriverOrders
};

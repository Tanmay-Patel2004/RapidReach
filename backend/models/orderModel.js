const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Represents userId (customerId)
    customerName: { type: String, required: true }, // Added customer name
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Added product ID
            name: String,
            quantity: Number,
            price: Number
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    assignedDrivers: [
        {
            driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Driver ID
            deliveryStatus: { type: String, enum: ['Pending', 'In Transit', 'Delivered'], default: 'Pending' }, // Delivery status
            deliveryTime: { type: Date } // Delivery time
        }
    ], // Added assignedDrivers array
    createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

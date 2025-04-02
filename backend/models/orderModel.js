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
    subtotal: { type: Number, required: true }, // Subtotal before tax
    tax: { type: Number, required: true }, // Tax amount
    taxRate: { type: Number, default: 0.13 }, // Tax rate (13%)
    totalAmount: { type: Number, required: true }, // Total amount including tax
    status: { type: String, default: 'Pending' },
    assignedDrivers: [
        {
            driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Driver ID
            deliveryStatus: { type: String, enum: ['Pending', 'Out for Delivery', 'In Transit', 'Delivered', 'Not Delivered'], default: 'Pending' }, // Delivery status
            deliveryTime: { type: Date }, // Delivery time
            notes: { type: String, default: '' } // Notes about delivery (e.g., reasons for non-delivery)
        }
    ], // Added assignedDrivers array
    createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

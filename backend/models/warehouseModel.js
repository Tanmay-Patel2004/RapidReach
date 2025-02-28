const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    warehouseCode: {
        type: String,
        required: [true, "Warehouse code is required"],
        unique: true,
        trim: true,
        uppercase: true
    },
    address: {
        street: {
            type: String,
            required: [true, "Street address is required"],
            trim: true
        },
        province: {
            type: String,
            required: [true, "Province is required"],
            trim: true
        },
        country: {
            type: String,
            required: [true, "Country is required"],
            trim: true
        },
        zipCode: {
            type: String,
            required: [true, "ZIP/Postal code is required"],
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[A-Za-z0-9\s-]+$/.test(v);
                },
                message: props => `${props.value} is not a valid postal/ZIP code!`
            }
        }
    }
}, {
    timestamps: true
});

// Create a compound index for better querying
// warehouseSchema.index({ warehouseCode: 1 });

module.exports = mongoose.model('Warehouse', warehouseSchema); 
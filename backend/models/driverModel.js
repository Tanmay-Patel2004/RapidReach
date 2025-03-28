const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Driver reference
  status: { type: String, enum: ['Idle', 'Assigned'], default: 'Idle' }, // Driver status
  activeTime: { type: Number, default: 0 }, // Total active time in milliseconds
  lastUpdated: { type: Date, default: Date.now } // Last updated time for active time
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;

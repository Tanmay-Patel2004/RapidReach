const Vendor = require('../models/vendorModel');

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private
const createVendor = async (req, res) => {
  try {
    const { name, type, email, phone, address } = req.body;

    // Check if vendor with email already exists
    const vendorExists = await Vendor.findOne({ email });
    if (vendorExists) {
      return res.status(400).json({ message: '❌ Vendor with this email already exists' });
    }

    const vendor = await Vendor.create({
      name,
      type,
      email,
      phone,
      address
    });

    res.status(201).json(vendor);
  } catch (error) {
    console.error('❌ Create Vendor Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private
const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({});
    res.json(vendors);
  } catch (error) {
    console.error('❌ Get All Vendors Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Private
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: '❌ Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    console.error('❌ Get Vendor Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private
const updateVendor = async (req, res) => {
  try {
    const { name, type, email, phone, address, isActive } = req.body;
    
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: '❌ Vendor not found' });
    }

    // Check if updating email and if it already exists
    if (email && email !== vendor.email) {
      const emailExists = await Vendor.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: '❌ Email already in use' });
      }
    }

    vendor.name = name || vendor.name;
    vendor.type = type || vendor.type;
    vendor.email = email || vendor.email;
    vendor.phone = phone || vendor.phone;
    vendor.address = address || vendor.address;
    vendor.isActive = isActive !== undefined ? isActive : vendor.isActive;

    const updatedVendor = await vendor.save();
    res.json(updatedVendor);
  } catch (error) {
    console.error('❌ Update Vendor Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: '❌ Vendor not found' });
    }

    await vendor.deleteOne();
    res.json({ message: '✅ Vendor removed successfully' });
  } catch (error) {
    console.error('❌ Delete Vendor Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor
}; 
const Vendor = require('../models/Vendor');
const Store = require('../models/Store');

// @desc    Register as a Vendor
// @route   POST /api/v1/vendors/register
// @access  Private (Vendor role)
const registerVendor = async (req, res, next) => {
  try {
    const { businessName, legalName, businessType, contactPhone, contactEmail, settlementCycle } = req.body;

    // Check if vendor profile already exists for this user
    const existingVendor = await Vendor.findOne({ userId: req.user._id });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor profile already exists for this account' });
    }

    const vendor = await Vendor.create({
      userId: req.user._id,
      businessName,
      legalName,
      businessType,
      contactPhone,
      contactEmail,
      settlementCycle,
    });

    res.status(201).json({
      status: 'success',
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a Store under vendor
// @route   POST /api/v1/stores
// @access  Private (Vendor)
const createStore = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found. Please register as vendor first.' });
    }

    const {
      name,
      slug,
      description,
      phone,
      email,
      coordinates, // [longitude, latitude]
      address,
      serviceRadiusKm,
      minimumOrderAmount,
      deliveryFee,
      operatingHours,
    } = req.body;

    const store = await Store.create({
      vendorId: vendor._id,
      name,
      slug,
      description,
      phone,
      email,
      location: {
        type: 'Point',
        coordinates: coordinates || [0, 0],
      },
      address,
      serviceRadiusKm,
      minimumOrderAmount,
      deliveryFee,
      operatingHours,
    });

    res.status(201).json({
      status: 'success',
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all stores for the logged-in vendor
// @route   GET /api/v1/stores/my-stores
// @access  Private (Vendor)
const getMyStores = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const stores = await Store.find({ vendorId: vendor._id, isDeleted: false });
    res.status(200).json({
      status: 'success',
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerVendor, createStore, getMyStores };
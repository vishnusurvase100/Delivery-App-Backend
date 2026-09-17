const Address = require('../models/Address');

// @desc    Add new address for user
// @route   POST /api/v1/addresses
// @access  Private (Customer)
const addAddress = async (req, res, next) => {
  try {
    const {
      label,
      recipientName,
      recipientPhone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country,
      coordinates, // [longitude, latitude]
      deliveryInstructions,
      isDefault,
    } = req.body;

    // If this address is set as default, unset other default addresses for this user
    if (isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      userId: req.user._id,
      label,
      recipientName,
      recipientPhone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country,
      location: {
        type: 'Point',
        coordinates: coordinates || [0, 0], // Default fallback if not provided
      },
      deliveryInstructions,
      isDefault: isDefault || false,
    });

    res.status(201).json({
      status: 'success',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all addresses for logged-in user
// @route   GET /api/v1/addresses
// @access  Private
const getUserAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ userId: req.user._id, isDeleted: false });
    res.status(200).json({
      status: 'success',
      count: addresses.length,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete an address
// @route   DELETE /api/v1/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });

    if (!address) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    address.isDeleted = true;
    address.deletedAt = new Date();
    await address.save();

    res.status(200).json({
      status: 'success',
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addAddress, getUserAddresses, deleteAddress };
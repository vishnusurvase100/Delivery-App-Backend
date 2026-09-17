const DeliverySlot = require('../models/DeliverySlot');
const DeliveryPartner = require('../models/DeliveryPartner');

// =======================
// ADMIN CONTROLLERS
// =======================

// @desc    Register as Delivery Partner
// @route   POST /api/v1/delivery/profile
// @access  Private (Delivery Partner)
const registerProfile = async (req, res, next) => {
  try {
    const { vehicleType, vehicleNumber, drivingLicense } = req.body;
    
    // Check if profile already exists
    const existing = await DeliveryPartner.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Profile pehle se bani hui hai.' });
    }

    const partner = await DeliveryPartner.create({
      userId: req.user._id,
      vehicleType,
      vehicleNumber,
      drivingLicense,
      status: 'active' // Testing ke liye direct 'active' kar rahe hain (Production me 'pending_approval' hoga)
    });

    res.status(201).json({ status: 'success', data: partner });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new delivery slot
// @route   POST /api/v1/delivery/slots
// @access  Private (Admin)
const createSlot = async (req, res, next) => {
  try {
    const { date, startTime, endTime, zone, maxCapacity } = req.body;

    const slot = await DeliverySlot.create({
      date,
      startTime,
      endTime,
      zone,
      maxCapacity,
    });

    res.status(201).json({ status: 'success', data: slot });
  } catch (error) {
    next(error);
  }
};

// =======================
// PARTNER CONTROLLERS
// =======================

// @desc    Get available slots for booking
// @route   GET /api/v1/delivery/slots
// @access  Private (Delivery Partner)
const getAvailableSlots = async (req, res, next) => {
  try {
    // Sirf aage aane wale slots dikhayenge
    const now = new Date();
    const slots = await DeliverySlot.find({
      endTime: { $gt: now },
      isActive: true,
    }).sort({ startTime: 1 });

    res.status(200).json({ status: 'success', count: slots.length, data: slots });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a slot
// @route   POST /api/v1/delivery/slots/:slotId/book
// @access  Private (Delivery Partner)
const bookSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const userId = req.user._id;

    const slot = await DeliverySlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // 1. Check if already booked
    if (slot.bookedBy.includes(userId)) {
      return res.status(400).json({ message: 'Aapne yeh slot pehle se book kiya hua hai.' });
    }

    // 2. Check Capacity
    if (slot.bookedBy.length >= slot.maxCapacity) {
      return res.status(400).json({ message: 'Yeh slot full ho chuka hai. Kripya dusra slot try karein.' });
    }

    // 3. Book the slot
    slot.bookedBy.push(userId);
    await slot.save();

    res.status(200).json({ status: 'success', message: 'Slot successfully booked!', data: slot });
  } catch (error) {
    next(error);
  }
};

// @desc    Partner Goes Live (The Magic Function)
// @route   POST /api/v1/delivery/go-live
// @access  Private (Delivery Partner)
const goLive = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { coordinates } = req.body; // [longitude, latitude]

    const partner = await DeliveryPartner.findOne({ userId });
    if (!partner) {
      return res.status(404).json({ message: 'Delivery profile nahi mili. Pehle profile register karein.' });
    }

    // Status check
    if (partner.status !== 'active') {
      return res.status(403).json({ message: 'Aapki profile abhi verify/active nahi hui hai.' });
    }

    // TIME & SLOT VALIDATION LOGIC 🔥
    const now = new Date();
    
    const activeSlot = await DeliverySlot.findOne({
      bookedBy: userId,
      startTime: { $lte: now }, // Slot shuru ho chuka ho (ya equal ho)
      endTime: { $gte: now },   // Slot abhi khatam na hua ho
      isActive: true
    });

    if (!activeSlot) {
      return res.status(403).json({ 
        message: 'Aapka is waqt ka koi slot booked nahi hai. Pehle slot book karein, tabhi aap live jaa sakte hain.' 
      });
    }

    // Validation Pass! Make the partner live & available
    partner.isLive = true;
    partner.isAvailable = true;
    
    if (coordinates) {
      partner.location.coordinates = coordinates;
      partner.location.lastUpdated = now;
    }
    
    await partner.save();

    res.status(200).json({ 
      status: 'success', 
      message: 'You are now LIVE and ready to receive orders! 🛵', 
      data: partner 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerProfile, createSlot, getAvailableSlots, bookSlot, goLive };
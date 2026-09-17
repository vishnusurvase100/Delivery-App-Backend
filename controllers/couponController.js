const Coupon = require('../models/Coupon');

// @desc    Create a new coupon
// @route   POST /api/v1/coupons
// @access  Private (Admin)
const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Coupon created successfully.',
      data: coupon
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists.' });
    }
    next(error);
  }
};

// @desc    Validate and calculate coupon discount
// @route   POST /api/v1/coupons/apply
// @access  Private (Customer)
const applyCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || !cartTotal) {
      return res.status(400).json({ message: 'Coupon code and cart total are required.' });
    }

    // 1. Fetch coupon and check basic validity
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code.' });
    }

    // 2. Check if coupon has expired
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }

    // 3. Check if coupon has reached its global usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon usage limit has been reached.' });
    }

    // 4. Check minimum order value criteria
    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ 
        message: `Add ₹${coupon.minOrderValue - cartTotal} more to your cart to use this coupon.` 
      });
    }

    // 5. Calculate Discount Mathematics
    let discountAmount = 0;

    if (coupon.discountType === 'flat') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      
      // Apply max discount cap if it exists
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal);
    const finalTotal = cartTotal - discountAmount;

    res.status(200).json({
      status: 'success',
      message: 'Coupon applied successfully!',
      data: {
        discountAmount,
        finalTotal,
        couponId: coupon._id
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { createCoupon, applyCoupon };
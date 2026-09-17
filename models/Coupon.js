const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // Always store codes in UPPERCASE (e.g., WELCOME50)
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true, // E.g., 20 (for 20%) or 50 (for ₹50 flat)
    },
    minOrderValue: {
      type: Number,
      default: 0, // Minimum cart value required to apply the coupon
    },
    maxDiscount: {
      type: Number,
      // Useful for percentage discounts: e.g., "50% off up to ₹100"
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null, // Maximum number of times this coupon can be used across the platform
    },
    usedCount: {
      type: Number,
      default: 0, // Tracks how many times it has been successfully used
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Indexes for fast querying when users apply coupons
couponSchema.index({ code: 1, isActive: 1, expiryDate: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
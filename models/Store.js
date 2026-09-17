const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: null,
    },
    logoUrl: {
      type: String,
      default: null,
    },
    coverImageUrl: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // Required order: [longitude, latitude]
        required: true,
      },
    },
    address: {
      line1: { type: String, required: true },
      line2: { type: String, default: null },
      landmark: { type: String, default: null },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
    },
    serviceRadiusKm: {
      type: Number,
      required: true,
      default: 5,
    },
    minimumOrderAmount: {
      type: mongoose.Types.Decimal128,
      default: 0.00,
    },
    deliveryFee: {
      type: mongoose.Types.Decimal128,
      default: 0.00,
    },
    freeDeliveryAbove: {
      type: mongoose.Types.Decimal128,
      default: null,
    },
    averagePreparationTimeMinutes: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'closed'],
      default: 'active',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    operatingHours: [
      {
        dayOfWeek: Number, // 0 (Sunday) to 6 (Saturday)
        isClosed: Boolean,
        openTime: { type: String, default: null }, // e.g. "09:00"
        closeTime: { type: String, default: null }, // e.g. "22:00"
      },
    ],
    isCurrentlyOpen: {
      type: Boolean,
      default: true,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// GeoJSON 2dsphere index for location-based nearby store discovery
storeSchema.index({ location: '2dsphere' });
storeSchema.index({ vendorId: 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Store', storeSchema);
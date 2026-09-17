const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ['bike', 'scooter', 'cycle', 'ev'],
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true, // e.g., MH 12 AB 1234
    },
    drivingLicense: {
      type: String, // Cycle ke liye optional ho sakta hai, but bike ke liye required
      default: null, 
    },
    // GeoJSON for tracking Live Location
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      }
    },
    isLive: {
      type: Boolean,
      default: false, // Kya usne app mein 'Go Live' swipe kiya hai?
    },
    isAvailable: {
      type: Boolean,
      default: false, // Live toh hai, par kya khali hai? (Agar order deliver kar raha hai toh false hoga)
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null, // Agar koi order mila hua hai, toh uski ID yahan aayegi
    },
    status: {
      type: String,
      enum: ['pending_approval', 'active', 'suspended'],
      default: 'pending_approval', // Admin verify karke 'active' karega
    }
  },
  { timestamps: true }
);

// 2dsphere index zaroori hai location-based (Nearest Rider) search ke liye!
deliveryPartnerSchema.index({ location: '2dsphere' });
deliveryPartnerSchema.index({ isLive: 1, isAvailable: 1 });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
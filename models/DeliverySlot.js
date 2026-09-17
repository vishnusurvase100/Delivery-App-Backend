const mongoose = require('mongoose');

const deliverySlotSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true, // Kis din ka slot hai (e.g., 2026-09-17)
    },
    startTime: {
      type: Date,
      required: true, // Slot kab shuru hoga (e.g., 8:00 AM)
    },
    endTime: {
      type: Date,
      required: true, // Slot kab khatam hoga (e.g., 12:00 PM)
    },
    zone: {
      type: String,
      required: true, // Kis area ke liye hai (e.g., "Wakad, Pune")
    },
    maxCapacity: {
      type: Number,
      required: true, // Is slot mein max kitne boys chahiye (e.g., 50)
    },
    bookedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Un delivery boys ke IDs jinhone yeh slot book kar liya hai
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Index for fast querying when checking available slots
deliverySlotSchema.index({ date: 1, zone: 1 });
deliverySlotSchema.index({ startTime: 1, endTime: 1 });

module.exports = mongoose.model('DeliverySlot', deliverySlotSchema);
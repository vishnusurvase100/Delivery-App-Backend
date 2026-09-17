const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema(
  {
    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Jisko paise milne hain (Vendor ya Rider)
    },
    payeeRole: {
      type: String,
      enum: ['vendor', 'delivery_partner'],
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: {
      type: Number,
      required: true, // Kitna paisa dena hai
    },
    commissionDeducted: {
      type: Number,
      default: 0, // Platform ne kitna cut liya (Sirf vendor ke case mein)
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending', // Jab admin pay kar dega toh 'completed' hoga
    },
    transactionRef: {
      type: String, // Bank ka UTR number ya transfer ID payout ke baad
    },
    settledAt: {
      type: Date, // Kis din paise account mein bheje gaye
    }
  },
  { timestamps: true }
);

// Admins ke liye fast query karne ke liye indexes
settlementSchema.index({ payeeId: 1, status: 1 });
settlementSchema.index({ status: 1 });

module.exports = mongoose.model('Settlement', settlementSchema);
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    legalName: {
      type: String,
      default: null,
    },
    businessType: {
      type: String,
      enum: ['individual', 'company', 'partnership', 'other'],
      required: true,
    },
    contactEmail: {
      type: String,
      default: null,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'submitted', 'verified', 'rejected', 'suspended'],
      default: 'pending',
    },
    verificationDocuments: [
      {
        type: String,
        url: String,
        status: String,
      },
    ],
    commissionRate: {
      type: mongoose.Types.Decimal128,
      default: 10.00, // Example default commission rate percentage
    },
    settlementCycle: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true }
);

vendorSchema.index({ verificationStatus: 1 });
vendorSchema.index({ status: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
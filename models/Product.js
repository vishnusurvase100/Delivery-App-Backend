const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    mrp: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    sellingPrice: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    unit: {
      type: String,
      required: true, // Example: "1 kg", "500 ml", "1 piece"
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    images: [
      {
        type: String, // Image URLs array
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for faster search and filtering
productSchema.index({ storeId: 1, categoryId: 1 });
productSchema.index({ name: 'text' }); 

module.exports = mongoose.model('Product', productSchema);
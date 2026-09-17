const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // The customer who is writing the review
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      // Optional: Because a review can be either for a store or a product
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      // Optional: Because a review can be either for a store or a product
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // 1 to 5 stars rating system
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500, // Restrict comment length to avoid spam
    }
  },
  { timestamps: true }
);

// Prevent a user from submitting multiple reviews for the same product or store
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ userId: 1, storeId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
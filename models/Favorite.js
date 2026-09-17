const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // The customer who owns this favorite list
    },
    itemType: {
      type: String,
      enum: ['store', 'product'],
      required: true, // Specifies whether a restaurant or a dish is being saved
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      // Populated only if itemType is 'store'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      // Populated only if itemType is 'product'
    }
  },
  { timestamps: true }
);

// Prevent duplicate favorites: A user can only favorite a specific store/product once
favoriteSchema.index({ userId: 1, storeId: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
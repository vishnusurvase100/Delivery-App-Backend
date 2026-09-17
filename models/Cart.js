const mongoose = require('mongoose');

// Cart ke andar items ka structure
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: mongoose.Types.Decimal128,
    required: true, // Item add karte time jo price tha, woh save karenge
  }
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Ek user ka ek hi active cart hoga
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null, // Yeh ensure karega ki cart sirf ek hi store se linked ho
    },
    items: [cartItemSchema],
    totalAmount: {
      type: mongoose.Types.Decimal128,
      default: 0.00,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
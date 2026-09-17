const mongoose = require('mongoose');

// Order items ka snapshot (Taaki agar kal ko product delete ho jaye, toh purane orders kharab na hon)
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, // Product ka naam fix kar lenge
  quantity: { type: Number, required: true },
  price: { type: mongoose.Types.Decimal128, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Delivery partner bhi ek User hai (jiska role 'delivery_partner' hoga)
      default: null, 
    },
    items: [orderItemSchema],
    deliveryAddress: {
      // Address ka snapshot save karenge, ID nahi. Kyunki agar user ne baad mein address update kiya, toh purane bills me address badalna nahi chahiye.
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      coordinates: { type: [Number] }, // [longitude, latitude] for delivery partner navigation
    },
    itemTotal: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    deliveryFee: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    totalAmount: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',                        // Customer ne order place kiya
        'accepted_by_vendor',             // Vendor ne accept kiya
        'preparing',                      // Khana/Saman pack ho raha hai
        'ready_for_pickup',               // Vendor ne ready kar diya
        'assigned_to_delivery_partner', 
        'accepted_by_rider',              // Delivery boy assign ho gaya (Aapki requirement)
        'out_for_delivery',               // Delivery boy raste mein hai
        'delivered',                      // Order pahunch gaya
        'cancelled'                       // Cancel ho gaya
      ],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: {
      type: String, // Razorpay ka generated order ID
    },
    razorpayPaymentId: {
      type: String, // Successful payment ka ID
    },
    razorpaySignature: {
      type: String, // Security verification ke liye
    },
    rejectedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Jinhone cancel kiya, unki list taaki dobara unhe na mile
      }
    ]
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1 });
orderSchema.index({ storeId: 1 });
orderSchema.index({ deliveryPartnerId: 1 });

module.exports = mongoose.model('Order', orderSchema);
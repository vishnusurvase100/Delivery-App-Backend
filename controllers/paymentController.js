const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Razorpay Instance Initialize karo
// (Production me in keys ko .env file me rakhte hain)
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere', 
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere',
});

// @desc    Create Razorpay Order
// @route   POST /api/v1/payments/create-order
// @access  Private (Customer)
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    // 1. Apne database mein order dhoondho
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order nahi mila' });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // 2. Razorpay Order options set karo
    const options = {
      amount: Math.round(order.totalAmount * 100), // Razorpay paise me amount leta hai (₹1 = 100 paise)
      currency: 'INR',
      receipt: `receipt_order_${order._id}`,
    };

    // 3. Razorpay ko request bhejo
    const razorpayOrder = await razorpayInstance.orders.create(options);

    if (!razorpayOrder) {
      return res.status(500).json({ message: 'Razorpay order create nahi ho paya' });
    }

    // 4. Apne database mein Razorpay Order ID save karo
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      status: 'success',
      message: 'Razorpay order created',
      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/v1/payments/verify
// @access  Private (Customer)
const verifyPayment = async (req, res, next) => {
  try {
    // Yeh teeno cheezein customer ke app se aayengi payment success hone ke baad
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere';

    // 1. Signature Verification Logic 🔥
    // Formula: HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret_key)
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", secret)
      .update(sign.toString())
      .digest("hex");

    // 2. Check agar signature match karta hai
    if (razorpay_signature === expectedSign) {
      
      // Payment 100% genuine hai! Database mein order update karo
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentStatus: 'completed',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          orderStatus: 'accepted_by_vendor' // Payment hote hi vendor ke paas alert jayega
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ message: 'Order database mein nahi mila' });
      }

      return res.status(200).json({ 
        status: 'success', 
        message: 'Payment successfully verified and order confirmed!', 
        data: order 
      });

    } else {
      // Fake payment pakdi gayi! Hacker alert!
      return res.status(400).json({ message: 'Invalid payment signature. Transaction failed or fake.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund for a cancelled order
// @route   POST /api/v1/payments/orders/:orderId/refund
// @access  Private (Admin / Vendor)
const processRefund = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Validate if the order is eligible for a refund
    if (order.paymentMethod !== 'ONLINE' || order.paymentStatus !== 'completed') {
      return res.status(400).json({ message: 'Refund is not applicable for this order.' });
    }

    if (order.orderStatus === 'cancelled' && order.paymentStatus === 'refunded') {
      return res.status(400).json({ message: 'Order is already cancelled and refunded.' });
    }

    // Process refund via Razorpay API
    const refund = await razorpayInstance.payments.refund(order.razorpayPaymentId, {
      amount: Math.round(order.totalAmount * 100), // Convert to paise
      speed: 'optimum', // Process refund at optimal speed based on Razorpay routing
      notes: {
        reason: reason || 'Order cancelled by vendor/admin',
        orderId: order._id.toString()
      }
    });

    if (!refund) {
      return res.status(500).json({ message: 'Razorpay refund failed.' });
    }

    // Update order status in the database
    order.orderStatus = 'cancelled';
    order.paymentStatus = 'refunded';
    await order.save();

    res.status(200).json({
      status: 'success',
      message: 'Refund initiated successfully.',
      data: {
        refundId: refund.id,
        status: refund.status,
        amountRefunded: refund.amount / 100
      }
    });

  } catch (error) {
    next(error);
  }
};

// Update the exports to include processRefund
module.exports = { createRazorpayOrder, verifyPayment, processRefund };
const express = require('express');
const router = express.Router();

// Ensure processRefund is imported
const { createRazorpayOrder, verifyPayment, processRefund } = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Payments & Refunds
 *   description: Razorpay integration and refund logic
 */

// All payment routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/payments/create-order:
 *   post:
 *     summary: Create a Razorpay Order
 *     description: Initializes a payment order with Razorpay before the frontend checkout process. Returns the Razorpay order ID required for the SDK.
 *     tags: [Payments & Refunds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The MongoDB ObjectId of the placed order
 *                 example: 60d21b4667d0d8992e610c85
 *     responses:
 *       200:
 *         description: Razorpay order created successfully
 *       400:
 *         description: Invalid order ID or order already paid
 *       401:
 *         description: Unauthorized
 */
router.post('/payments/create-order', authorize('customer'), createRazorpayOrder);

/**
 * @swagger
 * /api/v1/payments/verify:
 *   post:
 *     summary: Verify Razorpay Payment
 *     description: Verifies the payment signature returned by Razorpay after a successful client-side transaction. Updates the order status to 'paid'.
 *     tags: [Payments & Refunds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: 60d21b4667d0d8992e610c85
 *               razorpay_order_id:
 *                 type: string
 *                 example: order_IluGW1122334455
 *               razorpay_payment_id:
 *                 type: string
 *                 example: pay_IluGW1122334455
 *               razorpay_signature:
 *                 type: string
 *                 example: 9d34b... (hash)
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Payment verification failed (Invalid signature)
 *       401:
 *         description: Unauthorized
 */
router.post('/payments/verify', authorize('customer'), verifyPayment);

/**
 * @swagger
 * /api/v1/payments/orders/{orderId}/refund:
 *   post:
 *     summary: Process a Refund (Admin/Vendor)
 *     description: Cancels a paid order and initiates a refund back to the customer's original payment method via Razorpay.
 *     tags: [Payments & Refunds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the order to be refunded
 *         example: 60d21b4667d0d8992e610c85
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Item out of stock"
 *     responses:
 *       200:
 *         description: Refund initiated successfully
 *       400:
 *         description: Order not eligible for refund (e.g., not paid)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Only Admin/Vendor allowed)
 */
// Admin or Vendor route to cancel and refund an order
router.post('/payments/orders/:orderId/refund', authorize('admin', 'vendor'), processRefund);

module.exports = router;
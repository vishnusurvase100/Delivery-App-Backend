const express = require('express');
const router = express.Router();
const { createCoupon, applyCoupon } = require('../controllers/couponController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Promo codes and discount management
 */

// All coupon routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/coupons/apply:
 *   post:
 *     summary: Apply a coupon to cart
 *     description: Validates a promo code and calculates the discount amount based on the cart total.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - cartTotal
 *             properties:
 *               code:
 *                 type: string
 *                 description: The promo code entered by the user
 *                 example: WELCOME50
 *               cartTotal:
 *                 type: number
 *                 description: Current total value of the user's cart
 *                 example: 450
 *     responses:
 *       200:
 *         description: Coupon applied successfully (returns discount amount and final total)
 *       400:
 *         description: Invalid, expired coupon, or minimum order value not met
 *       401:
 *         description: Unauthorized
 */
router.post('/coupons/apply', authorize('customer'), applyCoupon);

/**
 * @swagger
 * /api/v1/coupons:
 *   post:
 *     summary: Create a new coupon (Admin)
 *     description: Generates a new promotional code with specific rules (flat/percentage, usage limits). Only accessible by admins.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountType
 *               - discountValue
 *               - expiryDate
 *             properties:
 *               code:
 *                 type: string
 *                 example: DIWALI20
 *               discountType:
 *                 type: string
 *                 enum: [flat, percentage]
 *                 example: percentage
 *               discountValue:
 *                 type: number
 *                 description: Flat amount or percentage value
 *                 example: 20
 *               minOrderValue:
 *                 type: number
 *                 description: Minimum cart value required to use this coupon
 *                 example: 300
 *               maxDiscount:
 *                 type: number
 *                 description: Maximum limit on percentage discounts
 *                 example: 100
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-12-31T23:59:59.000Z"
 *               usageLimit:
 *                 type: number
 *                 description: Total number of times this coupon can be used platform-wide
 *                 example: 500
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       400:
 *         description: Coupon code already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not an admin)
 */
router.post('/coupons', authorize('admin'), createCoupon);

module.exports = router;
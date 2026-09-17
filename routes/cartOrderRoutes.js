const express = require('express');
const router = express.Router();
const { addToCart, getCart, placeOrder } = require('../controllers/cartOrderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Cart & Orders
 *   description: Cart management and order placement
 */

// Har route par user login hona zaroori hai
router.use(protect);

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get user's cart
 *     description: Retrieves the current cart items for the logged-in customer or admin.
 *     tags: [Cart & Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched the cart details
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 * 
 *   post:
 *     summary: Add an item to the cart
 *     description: Adds a product to the user's cart or updates its quantity.
 *     tags: [Cart & Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The MongoDB ObjectId of the product
 *                 example: 60d21b4667d0d8992e610c85
 *               quantity:
 *                 type: integer
 *                 description: Quantity to add (or update)
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item successfully added to the cart
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Product not found
 */
router.route('/cart')
  .get(authorize('customer', 'admin'), getCart)
  .post(authorize('customer', 'admin'), addToCart);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Place a new order
 *     description: Places an order using the items currently in the user's cart. Clears the cart upon success.
 *     tags: [Cart & Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryAddressId
 *               - paymentMethod
 *             properties:
 *               deliveryAddressId:
 *                 type: string
 *                 description: The MongoDB ObjectId of the user's saved address
 *                 example: 60d21b4667d0d8992e610c99
 *               paymentMethod:
 *                 type: string
 *                 enum: [ONLINE, COD]
 *                 description: The chosen method of payment
 *                 example: ONLINE
 *               couponCode:
 *                 type: string
 *                 description: Optional promo code for discount
 *                 example: ZOMATO50
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Cart is empty or invalid address
 *       401:
 *         description: Unauthorized
 */
router.route('/orders')
  .post(authorize('customer', 'admin'), placeOrder);

module.exports = router;
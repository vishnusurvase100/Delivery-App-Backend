const express = require('express');
const router = express.Router();
const { registerVendor, createStore, getMyStores } = require('../controllers/vendorStoreController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Vendor store management
 */

// YAHAN SE 'router.use(protect);' HATA DIYA HAI
// Aur har route par individually 'protect' laga diya hai:

/**
 * @swagger
 * /api/v1/vendors/register:
 *   post:
 *     summary: Register Vendor Business Details
 *     description: Submit KYC and business details to become a verified vendor.
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - fssaiLicense
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: "Sharma Ji Ka Dhaba"
 *               fssaiLicense:
 *                 type: string
 *                 example: "10012011000234"
 *               gstNumber:
 *                 type: string
 *                 example: "22AAAAA0000A1Z5"
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not a vendor)
 */
// Vendor Routes
router.post('/vendors/register', protect, authorize('vendor', 'admin'), registerVendor);

/**
 * @swagger
 * /api/v1/stores:
 *   post:
 *     summary: Create a new store (Restaurant)
 *     description: Vendors can add a new physical store location to the platform.
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sharma Ji Ka Dhaba - Pune Branch"
 *               address:
 *                 type: string
 *                 example: "123, FC Road, Pune"
 *               cuisineType:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["North Indian", "Street Food"]
 *               deliveryRadius:
 *                 type: number
 *                 description: Delivery radius in kilometers
 *                 example: 5
 *     responses:
 *       201:
 *         description: Store created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Store Routes
router.route('/stores')
  .post(protect, authorize('vendor', 'admin'), createStore);

/**
 * @swagger
 * /api/v1/stores/my-stores:
 *   get:
 *     summary: Get my stores
 *     description: Retrieve a list of all stores managed by the currently logged-in vendor.
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched vendor's stores
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stores/my-stores', protect, authorize('vendor', 'admin'), getMyStores);

module.exports = router;
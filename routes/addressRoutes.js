const express = require('express');
const router = express.Router();
const { addAddress, getUserAddresses, deleteAddress } = require('../controllers/addressController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: User delivery address management
 */

// All address routes require authentication
router.use(protect); 

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Add a new delivery address
 *     description: Creates a new address for the logged-in customer. Only customers are authorized.
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - city
 *               - state
 *               - zipCode
 *             properties:
 *               street:
 *                 type: string
 *                 example: 123 Main Street, Apt 4B
 *               city:
 *                 type: string
 *                 example: Pune
 *               state:
 *                 type: string
 *                 example: Maharashtra
 *               zipCode:
 *                 type: string
 *                 example: "411001"
 *               country:
 *                 type: string
 *                 example: India
 *               label:
 *                 type: string
 *                 enum: [Home, Work, Other]
 *                 example: Home
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       403:
 *         description: Forbidden (Not a customer)
 * 
 *   get:
 *     summary: Get user addresses
 *     description: Retrieves a list of all addresses saved by the logged-in user.
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched list of addresses
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 */
router.route('/')
  .post(authorize('customer'), addAddress)
  .get(getUserAddresses);

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     description: Removes a specific address from the user's account using the address ID.
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique MongoDB ObjectId of the address
 *         example: 60d21b4667d0d8992e610c85
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.route('/:id')
  .delete(deleteAddress);

module.exports = router;
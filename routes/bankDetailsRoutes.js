const express = require('express');
const router = express.Router();
const { addOrUpdateBankDetails, getBankDetails } = require('../controllers/bankDetailsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Bank Details
 *   description: Bank account management for Vendor & Delivery Partner payouts
 */

// Sirf Vendor aur Delivery Partner hi apne bank details daal sakte hain
router.use(protect);
router.use(authorize('vendor', 'delivery_partner'));

/**
 * @swagger
 * /api/v1/bank-details:
 *   post:
 *     summary: Add or Update Bank Details
 *     description: Save bank account information to receive platform payouts.
 *     tags: [Bank Details]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountHolderName
 *               - accountNumber
 *               - ifscCode
 *               - bankName
 *             properties:
 *               accountHolderName:
 *                 type: string
 *                 example: "Raju Vendor"
 *               accountNumber:
 *                 type: string
 *                 example: "123456789012"
 *               ifscCode:
 *                 type: string
 *                 example: "HDFC0001234"
 *               bankName:
 *                 type: string
 *                 example: "HDFC Bank"
 *               accountType:
 *                 type: string
 *                 enum: [savings, current]
 *                 example: "current"
 *     responses:
 *       200:
 *         description: Bank details updated successfully
 *       201:
 *         description: Bank details added successfully
 *       401:
 *         description: Unauthorized
 * 
 *   get:
 *     summary: Get my bank details
 *     description: Retrieve saved bank account details for the logged-in user.
 *     tags: [Bank Details]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched bank details
 *       404:
 *         description: Bank details not found
 */
router.route('/bank-details')
  .post(addOrUpdateBankDetails)
  .get(getBankDetails);

module.exports = router;
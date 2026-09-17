const express = require('express');
const router = express.Router();
const { getPendingSettlements, processPayout } = require('../controllers/settlementController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Settlements
 *   description: Financial ledger and payouts for vendors and riders
 */

// Secure all settlement routes for Admin access only
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/v1/settlements/pending:
 *   get:
 *     summary: Get all pending settlements
 *     description: Retrieves a list of all unpaid settlements for vendors and delivery partners. Only accessible by admins.
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched pending settlements
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       403:
 *         description: Forbidden (Not an admin)
 */
// Fetch pending settlements
router.get('/settlements/pending', getPendingSettlements);

/**
 * @swagger
 * /api/v1/settlements/{id}/process:
 *   put:
 *     summary: Process a settlement payout
 *     description: Marks a specific pending settlement as completed/paid after the admin has transferred the funds.
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the settlement record
 *         example: 60d21b4667d0d8992e610c85
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: Optional bank transaction reference number
 *                 example: "TXN9876543210"
 *               notes:
 *                 type: string
 *                 description: Admin remarks for the payout
 *                 example: "Weekly payout processed"
 *     responses:
 *       200:
 *         description: Settlement processed successfully
 *       400:
 *         description: Settlement already processed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Settlement record not found
 */
// Process a specific settlement
router.put('/settlements/:id/process', processPayout);

module.exports = router;
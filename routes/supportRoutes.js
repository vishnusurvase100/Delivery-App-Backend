const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, respondToTicket } = require('../controllers/supportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Helpdesk ticket system for customers, vendors, and riders
 */

// All support routes require login
router.use(protect);

/**
 * @swagger
 * /api/v1/support:
 *   post:
 *     summary: Create a support ticket
 *     description: Customers, Delivery Partners, or Vendors can raise an issue regarding an order, payment, or general query.
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Order not delivered but marked as complete"
 *               description:
 *                 type: string
 *                 example: "The rider marked the order as delivered 10 minutes ago, but I haven't received it."
 *               orderId:
 *                 type: string
 *                 description: Optional MongoDB ObjectId of the related order
 *                 example: 60d21b4667d0d8992e610c85
 *     responses:
 *       201:
 *         description: Support ticket created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post('/support', createTicket);

/**
 * @swagger
 * /api/v1/support/my-tickets:
 *   get:
 *     summary: Get my support tickets
 *     description: Retrieve all support tickets raised by the currently logged-in user.
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched user's support tickets
 *       401:
 *         description: Unauthorized
 */
router.get('/support/my-tickets', getMyTickets);

/**
 * @swagger
 * /api/v1/support/{id}/respond:
 *   put:
 *     summary: Respond to a support ticket (Admin)
 *     description: Admins can reply to an open ticket and optionally update its status (e.g., to resolved).
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the support ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminResponse
 *             properties:
 *               adminResponse:
 *                 type: string
 *                 description: The reply/solution provided by the admin
 *                 example: "We have checked with the rider and processed a full refund to your wallet."
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, resolved, closed]
 *                 description: Update the ticket status
 *                 example: "resolved"
 *     responses:
 *       200:
 *         description: Ticket responded to and updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not an admin)
 *       404:
 *         description: Ticket not found
 */
// Route for Admins only
router.put('/support/:id/respond', authorize('admin'), respondToTicket);

module.exports = router;
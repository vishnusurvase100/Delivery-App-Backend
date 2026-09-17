const express = require('express');
const router = express.Router();
const { autoAssignOrder } = require('../controllers/dispatchController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/v1/dispatch/{orderId}/auto-assign:
 *   post:
 *     summary: Auto-assign an order to the nearest delivery partner (Admin Trigger)
 *     description: Triggers the auto-dispatch engine to find the nearest available delivery partner and assign the specified order to them. In production, this runs in the background, but this endpoint allows admins to trigger it manually.
 *     tags: [Delivery & Dispatch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the order to dispatch
 *         example: 60d21b4667d0d8992e610c85
 *     responses:
 *       200:
 *         description: Order successfully assigned to a delivery partner
 *       400:
 *         description: No available delivery partners found nearby or order already assigned
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       403:
 *         description: Forbidden (Not an admin)
 *       404:
 *         description: Order not found
 */
// Yeh trigger filhal hum API se karenge, production mein yeh automatically 
// order place hone par ya cron job se background me chalta hai.
router.post('/dispatch/:orderId/auto-assign', protect, authorize('admin'), autoAssignOrder);

module.exports = router;
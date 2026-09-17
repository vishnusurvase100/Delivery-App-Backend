const express = require('express');
const router = express.Router();
const { registerProfile, createSlot, getAvailableSlots, bookSlot, goLive } = require('../controllers/deliveryController');

// 👇 Yahan humne saare partner controllers ko ek hi line mein import kiya hai
const { respondToOrder, updateOrderStatus, emergencyTransfer } = require('../controllers/partnerOrderController'); 

const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Delivery & Dispatch
 *   description: Rider assignment, emergency transfers, and status updates
 */

// All delivery routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/delivery/profile:
 *   post:
 *     summary: Register Delivery Partner Profile
 *     description: Set up a delivery partner's profile with vehicle and license details.
 *     tags: [Delivery & Dispatch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleType:
 *                 type: string
 *                 example: Bike
 *               vehicleNumber:
 *                 type: string
 *                 example: MH12AB1234
 *               licenseNumber:
 *                 type: string
 *                 example: MH1220190000000
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/delivery/profile', authorize('delivery_partner', 'admin'), registerProfile);

/**
 * @swagger
 * /api/v1/delivery/slots:
 *   get:
 *     summary: Get available delivery slots
 *     description: Fetch slots that delivery partners can book for their shifts.
 *     tags: [Delivery & Dispatch]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched slots
 *   post:
 *     summary: Create a delivery slot (Admin)
 *     description: Admins create time slots for riders to book.
 *     tags: [Delivery & Dispatch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-18T08:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-18T12:00:00Z"
 *               capacity:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       201:
 *         description: Slot created successfully
 */
router.route('/delivery/slots')
  .get(authorize('delivery_partner', 'admin'), getAvailableSlots)
  .post(authorize('admin'), createSlot);

/**
 * @swagger
 * /api/v1/delivery/slots/{slotId}/book:
 *   post:
 *     summary: Book a delivery slot
 *     description: Delivery partner books an available slot for their shift.
 *     tags: [Delivery & Dispatch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the slot
 *     responses:
 *       200:
 *         description: Slot booked successfully
 *       400:
 *         description: Slot full or already booked
 */
router.post('/delivery/slots/:slotId/book', authorize('delivery_partner', 'admin'), bookSlot);

/**
 * @swagger
 * /api/v1/delivery/go-live:
 *   post:
 *     summary: Toggle Go-Live Status
 *     description: Allows a delivery partner to go online to receive orders, or go offline.
 *     tags: [Delivery & Dispatch]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.post('/delivery/go-live', authorize('delivery_partner', 'admin'), goLive);

/**
 * @swagger
 * /api/v1/delivery/orders/{orderId}/respond:
 *   post:
 *     summary: Accept or Reject an assigned order
 *     description: Rider responds to an order assigned to them by the auto-dispatch system.
 *     tags: [Delivery & Dispatch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *                 enum: [accept, reject]
 *                 example: accept
 *     responses:
 *       200:
 *         description: Order response recorded
 */
router.post('/delivery/orders/:orderId/respond', authorize('delivery_partner', 'admin'), respondToOrder);

/**
 * @swagger
 * /api/v1/delivery/orders/{orderId}/status:
 *   put:
 *     summary: Update Order Status (Pickup/Deliver)
 *     description: Rider updates the progress of an accepted order (e.g., picked_up, delivered). Automatically triggers settlement on 'delivered'.
 *     tags: [Delivery & Dispatch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [picked_up, on_the_way, delivered]
 *                 example: delivered
 *     responses:
 *       200:
 *         description: Order status updated and push notification sent
 */
router.put('/delivery/orders/:orderId/status', authorize('delivery_partner', 'admin'), updateOrderStatus);

/**
 * @swagger
 * /api/v1/delivery/orders/{orderId}/emergency-transfer:
 *   post:
 *     summary: Emergency Order Transfer
 *     description: Rider reports an emergency (breakdown/accident). Order is unassigned, reverted to pending, and rider is taken offline.
 *     tags: [Delivery & Dispatch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Bike breakdown"
 *     responses:
 *       200:
 *         description: Emergency recorded, order reassigned
 */
router.post('/delivery/orders/:orderId/emergency-transfer', authorize('delivery_partner', 'admin'), emergencyTransfer); 

module.exports = router;
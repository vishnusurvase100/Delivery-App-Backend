const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Admin Dashboard
 *   description: Analytics and platform statistics
 */

// Dashboard is highly confidential, strictly for Admins
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get Admin Dashboard Statistics
 *     description: Retrieves high-level analytics including user counts, order volumes, revenue, platform profit, and pending settlements. Only accessible by authenticated admins.
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         breakdown:
 *                           type: object
 *                           example: { "customer": 120, "vendor": 15, "delivery_partner": 15 }
 *                     orders:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 500
 *                         today:
 *                           type: integer
 *                           example: 45
 *                     financials:
 *                       type: object
 *                       properties:
 *                         totalSalesVolume:
 *                           type: number
 *                           example: 150000
 *                         platformProfit:
 *                           type: number
 *                           example: 15000
 *                         pendingPayouts:
 *                           type: number
 *                           example: 45000
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       403:
 *         description: Forbidden (Not an admin)
 *       500:
 *         description: Server error
 */
router.get('/admin/dashboard', getDashboardStats);

module.exports = router;
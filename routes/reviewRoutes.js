const express = require('express');
const router = express.Router();
const { addReview, getReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reviews & Ratings
 *   description: Customer feedback for food and delivery
 */

/**
 * @swagger
 * /api/v1/reviews:
 *   get:
 *     summary: Get reviews for a restaurant or product
 *     description: Fetch a public list of reviews and ratings for a specific restaurant or food item.
 *     tags: [Reviews & Ratings]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the restaurant or product
 *         example: 60d21b4667d0d8992e610c85
 *       - in: query
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [restaurant, product]
 *         description: Specify whether fetching reviews for a restaurant or a product
 *         example: restaurant
 *     responses:
 *       200:
 *         description: Successfully fetched reviews
 *       400:
 *         description: Missing required query parameters
 * 
 *   post:
 *     summary: Add a review and rating
 *     description: Authenticated customers can leave a rating (1-5) and review for a restaurant or product.
 *     tags: [Reviews & Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetId
 *               - targetType
 *               - rating
 *             properties:
 *               targetId:
 *                 type: string
 *                 description: MongoDB ObjectId of the restaurant or product
 *                 example: 60d21b4667d0d8992e610c85
 *               targetType:
 *                 type: string
 *                 enum: [restaurant, product]
 *                 example: restaurant
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating out of 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 description: Optional text review
 *                 example: "The food was absolutely delicious and arrived hot!"
 *     responses:
 *       201:
 *         description: Review added successfully
 *       400:
 *         description: Invalid input data or user has already reviewed this item
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       403:
 *         description: Forbidden (Not a customer)
 */
// Public route to view reviews
router.get('/reviews', getReviews);

// Private route to add a review (Only authenticated customers can review)
router.post('/reviews', protect, authorize('customer'), addReview);

module.exports = router;
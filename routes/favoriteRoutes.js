const express = require('express');
const router = express.Router();
const { addFavorite, getFavorites, removeFavorite } = require('../controllers/favoriteController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: User wishlist for favorite stores and dishes
 */

// All favorite routes require the user to be logged in as a customer
router.use(protect);
router.use(authorize('customer'));

/**
 * @swagger
 * /api/v1/favorites:
 *   post:
 *     summary: Add to favorites
 *     description: Add a restaurant or food item to the customer's wishlist.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - type
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: MongoDB ObjectId of the restaurant or product
 *                 example: 60d21b4667d0d8992e610c85
 *               type:
 *                 type: string
 *                 enum: [restaurant, product]
 *                 description: Specifies whether saving a store or a specific food item
 *                 example: restaurant
 *     responses:
 *       201:
 *         description: Item added to favorites successfully
 *       400:
 *         description: Item already in favorites or invalid input
 *       401:
 *         description: Unauthorized
 * 
 *   get:
 *     summary: Get all favorites
 *     description: Fetch the list of all saved restaurants and food items for the logged-in customer.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved favorites list
 *       401:
 *         description: Unauthorized
 */
router.route('/favorites')
  .post(addFavorite)
  .get(getFavorites);

/**
 * @swagger
 * /api/v1/favorites/{id}:
 *   delete:
 *     summary: Remove a favorite
 *     description: Remove a specific item from the customer's favorites using the favorite entry ID.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the favorite entry to remove
 *         example: 60f32c4667d0d8992e610d99
 *     responses:
 *       200:
 *         description: Item removed from favorites successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Favorite item not found
 */
router.route('/:id')
  .delete(removeFavorite);

module.exports = router;
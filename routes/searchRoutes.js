const express = require('express');
const router = express.Router();
const { searchStores, searchProducts } = require('../controllers/searchController');

/**
 * @swagger
 * tags:
 *   name: Search & Discovery
 *   description: Search restaurants and food items globally (with Geo-spatial filtering)
 */

/**
 * @swagger
 * /api/v1/search/stores:
 *   get:
 *     summary: Search for restaurants
 *     description: Public route to search restaurants by name, cuisine, or location. Send latitude and longitude to find nearest stores.
 *     tags: [Search & Discovery]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search term (e.g., "KFC", "Burger", "Pizza")
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           format: float
 *         description: User's latitude for proximity search (e.g., 18.5204 for Pune)
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *           format: float
 *         description: User's longitude for proximity search (e.g., 73.8567 for Pune)
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: Search radius in kilometers
 *     responses:
 *       200:
 *         description: Successfully fetched matching stores
 *       500:
 *         description: Server error
 */
router.get('/search/stores', searchStores);

/**
 * @swagger
 * /api/v1/search/products:
 *   get:
 *     summary: Search for food items
 *     description: Public route to search specific food items across all restaurants. Can filter by vegetarian only.
 *     tags: [Search & Discovery]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search term (e.g., "Paneer Tikka", "Cold Coffee")
 *         required: true
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           format: float
 *         description: User's latitude to find food nearby
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *           format: float
 *         description: User's longitude
 *       - in: query
 *         name: isVeg
 *         schema:
 *           type: boolean
 *         description: Set to true to filter only vegetarian items
 *     responses:
 *       200:
 *         description: Successfully fetched matching food items
 *       400:
 *         description: Keyword is required
 *       500:
 *         description: Server error
 */
router.get('/search/products', searchProducts);

module.exports = router;
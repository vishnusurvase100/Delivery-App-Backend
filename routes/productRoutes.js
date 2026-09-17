const express = require('express');
const router = express.Router();
const { createCategory, getCategories, createProduct, getProductsByStore } = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Menu & Products
 *   description: Food items and menu management
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all food categories
 *     description: Fetch a public list of all food categories (e.g., North Indian, Chinese, Fast Food).
 *     tags: [Menu & Products]
 *     security: []
 *     responses:
 *       200:
 *         description: Successfully fetched categories
 *   post:
 *     summary: Create a new category
 *     description: Admins or Vendors can create a new food category.
 *     tags: [Menu & Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Desserts
 *               description:
 *                 type: string
 *                 example: Sweet treats and beverages
 *               image:
 *                 type: string
 *                 example: https://example.com/images/dessert.jpg
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.route('/categories')
  .get(getCategories)
  .post(protect, authorize('admin', 'vendor'), createCategory);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Add a new product (Menu Item)
 *     description: Vendors or Admins can add a new food item to a specific restaurant's menu.
 *     tags: [Menu & Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - storeId
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: Paneer Butter Masala
 *               description:
 *                 type: string
 *                 example: Rich and creamy curry made with paneer, spices, onions, and tomatoes.
 *               price:
 *                 type: number
 *                 example: 250
 *               storeId:
 *                 type: string
 *                 description: MongoDB ObjectId of the vendor's store
 *                 example: 60d21b4667d0d8992e610c85
 *               category:
 *                 type: string
 *                 description: MongoDB ObjectId of the category
 *                 example: 60f32c4667d0d8992e610d99
 *               isVeg:
 *                 type: boolean
 *                 example: true
 *               image:
 *                 type: string
 *                 example: https://example.com/images/paneer.jpg
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.route('/products')
  .post(protect, authorize('vendor', 'admin'), createProduct);

/**
 * @swagger
 * /api/v1/products/store/{storeId}:
 *   get:
 *     summary: Get all products for a specific store
 *     description: Fetch the complete public menu of a specific restaurant using its store ID.
 *     tags: [Menu & Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the vendor's store
 *         example: 60d21b4667d0d8992e610c85
 *     responses:
 *       200:
 *         description: Successfully fetched store products
 *       404:
 *         description: Store not found
 */
// Get products by store - Yeh strictly PUBLIC hai
router.get('/products/store/:storeId', getProductsByStore);

module.exports = router;
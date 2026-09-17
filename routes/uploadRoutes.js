const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Image upload API using Cloudinary
 */

/**
 * @swagger
 * /api/v1/upload:
 *   post:
 *     summary: Upload an image
 *     description: Uploads an image (food item, avatar, or restaurant logo) to Cloudinary and returns the secure URL.
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload (jpg, png, jpeg, webp)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 imageUrl:
 *                   type: string
 *                   example: https://res.cloudinary.com/demo/image/upload/v1234567890/food_delivery_assets/sample.jpg
 *       400:
 *         description: No image file provided
 */
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file' });
  }

  // Cloudinary automatically file path mein apna URL bhejta hai
  res.status(200).json({
    status: 'success',
    message: 'Image uploaded successfully',
    imageUrl: req.file.path, 
  });
});

module.exports = router;
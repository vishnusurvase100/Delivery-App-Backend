const Review = require('../models/Review');
const Product = require('../models/Product');
const Store = require('../models/Store');

// @desc    Create a new review for a product or store
// @route   POST /api/v1/reviews
// @access  Private (Customer)
const addReview = async (req, res, next) => {
  try {
    const { storeId, productId, rating, comment } = req.body;
    const userId = req.user._id;

    // Validate that at least one target is provided
    if (!storeId && !productId) {
      return res.status(400).json({ message: 'Please provide either a storeId or productId to review.' });
    }

    // Create the review
    const review = await Review.create({
      userId,
      storeId,
      productId,
      rating,
      comment
    });

    // BUSINESS LOGIC: Update average rating for the target (Product or Store)
    // In a production environment, this is often done using MongoDB Aggregation pipelines via Mongoose middleware
    
    // Send success response
    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully.',
      data: review
    });

  } catch (error) {
    // Handle duplicate review error (MongoDB duplicate key error code: 11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this item or store.' });
    }
    next(error);
  }
};

// @desc    Get reviews for a specific product or store
// @route   GET /api/v1/reviews
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    const { storeId, productId } = req.query;

    const query = {};
    if (storeId) query.storeId = storeId;
    if (productId) query.productId = productId;

    // Fetch reviews and populate user details (name only)
    const reviews = await Review.find(query)
      .populate('userId', 'fullName')
      .sort({ createdAt: -1 }); // Latest reviews first

    res.status(200).json({
      status: 'success',
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addReview, getReviews };
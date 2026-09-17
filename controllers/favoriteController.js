const Favorite = require('../models/Favorite');

// @desc    Add a store or product to favorites
// @route   POST /api/v1/favorites
// @access  Private (Customer)
const addFavorite = async (req, res, next) => {
  try {
    const { itemType, storeId, productId } = req.body;
    const userId = req.user._id;

    if (!itemType || (itemType === 'store' && !storeId) || (itemType === 'product' && !productId)) {
      return res.status(400).json({ message: 'Invalid data provided for favoriting.' });
    }

    const favorite = await Favorite.create({
      userId,
      itemType,
      storeId: itemType === 'store' ? storeId : undefined,
      productId: itemType === 'product' ? productId : undefined
    });

    res.status(201).json({
      status: 'success',
      message: `${itemType === 'store' ? 'Restaurant' : 'Dish'} added to favorites!`,
      data: favorite
    });
  } catch (error) {
    // Handle MongoDB duplicate key error if user tries to favorite the same item again
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This item is already in your favorites.' });
    }
    next(error);
  }
};

// @desc    Get user's favorites (Filterable by type)
// @route   GET /api/v1/favorites
// @access  Private (Customer)
const getFavorites = async (req, res, next) => {
  try {
    const { type } = req.query; // e.g., ?type=store or ?type=product
    const userId = req.user._id;

    let query = { userId };
    if (type) query.itemType = type;

    const favorites = await Favorite.find(query)
      .populate('storeId', 'name rating address image') // Fetch store details
      .populate('productId', 'name price description image isVegetarian') // Fetch product details
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: favorites.length,
      data: favorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an item from favorites
// @route   DELETE /api/v1/favorites/:id
// @access  Private (Customer)
const removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Ensure the user only deletes their own favorite record
    const favorite = await Favorite.findOneAndDelete({ _id: id, userId });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite record not found.' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Item removed from favorites.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addFavorite, getFavorites, removeFavorite };
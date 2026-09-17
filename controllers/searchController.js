const Store = require('../models/Store');
const Product = require('../models/Product');

// @desc    Search and filter nearest stores
// @route   GET /api/v1/search/stores
// @access  Public
const searchStores = async (req, res, next) => {
  try {
    const { keyword, lat, lng, maxDistance = 10000 } = req.query; // maxDistance default: 10km

    let query = {};

    // 1. Text-based search (Regex for partial matching like "baker" -> "Ramesh Bakery")
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' }; // 'i' makes it case-insensitive
    }

    // 2. Geospatial search (Nearest restaurants)
    // Note: This requires a '2dsphere' index on the Store's coordinates field in MongoDB
    if (lat && lng) {
      query.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)], // MongoDB expects [longitude, latitude]
          },
          $maxDistance: parseInt(maxDistance), // Distance in meters
        },
      };
    }

    // Execute the query
    const stores = await Store.find(query).select('name address coordinates rating isActive');

    res.status(200).json({
      status: 'success',
      count: stores.length,
      data: stores
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search and filter products (Dishes)
// @route   GET /api/v1/search/products
// @access  Public
const searchProducts = async (req, res, next) => {
  try {
    const { keyword, isVegetarian, storeId, minPrice, maxPrice } = req.query;

    let query = { isActive: true }; // Only show available products

    // 1. Keyword search in product name or description
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 2. Veg / Non-Veg Filter
    if (isVegetarian !== undefined) {
      query.isVegetarian = isVegetarian === 'true'; // Convert string to boolean
    }

    // 3. Filter by a specific store (Useful when searching inside a restaurant's menu)
    if (storeId) {
      query.storeId = storeId;
    }

    // 4. Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    // Execute query and populate store details (to show which restaurant sells this dish)
    const products = await Product.find(query)
      .populate('storeId', 'name rating') 
      .sort({ price: 1 }); // Sort by price low to high by default

    res.status(200).json({
      status: 'success',
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchStores, searchProducts };
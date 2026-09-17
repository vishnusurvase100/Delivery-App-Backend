const Category = require('../models/Category');
const Product = require('../models/Product');
const Store = require('../models/Store');

// @desc    Create a new Category
// @route   POST /api/v1/categories
// @access  Private (Admin only - ideally, but allowing for testing)
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, imageUrl } = req.body;
    
    const category = await Category.create({ name, slug, description, imageUrl });
    
    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Categories
// @route   GET /api/v1/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.status(200).json({ status: 'success', count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new Product
// @route   POST /api/v1/products
// @access  Private (Vendor)
const createProduct = async (req, res, next) => {
  try {
    const { storeId, categoryId, name, description, mrp, sellingPrice, unit, stockQuantity } = req.body;

    // Verify if the store belongs to the logged-in vendor
    const store = await Store.findOne({ _id: storeId, isDeleted: false });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const product = await Product.create({
      vendorId: store.vendorId, // Taken directly from the store
      storeId,
      categoryId,
      name,
      description,
      mrp,
      sellingPrice,
      unit,
      stockQuantity,
      inStock: stockQuantity > 0,
    });

    res.status(201).json({ status: 'success', data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Products by Store ID
// @route   GET /api/v1/products/store/:storeId
// @access  Public
const getProductsByStore = async (req, res, next) => {
  try {
    const products = await Product.find({ storeId: req.params.storeId, isDeleted: false, status: 'active' })
      .populate('categoryId', 'name slug'); // Populates category details
      
    res.status(200).json({ status: 'success', count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCategory, getCategories, createProduct, getProductsByStore };
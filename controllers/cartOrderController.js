const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');

// =======================
// CART CONTROLLERS
// =======================

// @desc    Add Item to Cart
// @route   POST /api/v1/cart
// @access  Private (Customer)
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // 1. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 2. Find user's cart
    let cart = await Cart.findOne({ userId });
    const productPrice = parseFloat(product.sellingPrice.toString());

    if (!cart) {
      // 3. Create new cart if doesn't exist
      cart = await Cart.create({
        userId,
        storeId: product.storeId,
        items: [{ productId, quantity, price: productPrice }],
        totalAmount: productPrice * quantity
      });
    } else {
      // 4. SINGLE STORE VALIDATION
      if (cart.storeId && cart.storeId.toString() !== product.storeId.toString()) {
        return res.status(400).json({ 
          message: 'Aapke cart mein dusre store ka saman hai. Pehle apna cart clear karein ya naye store se hi order karein.' 
        });
      }

      // Restore storeId if cart was previously emptied
      if (!cart.storeId) cart.storeId = product.storeId;

      // 5. Check if item already in cart
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ productId, quantity, price: productPrice });
      }

      // 6. Recalculate Total
      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + (item.quantity * parseFloat(item.price.toString()));
      }, 0);

      await cart.save();
    }

    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Cart Details
// @route   GET /api/v1/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId', 'name images unit');
    if (!cart) {
      return res.status(200).json({ status: 'success', message: 'Cart is empty', data: null });
    }
    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    next(error);
  }
};

// =======================
// ORDER CONTROLLERS
// =======================

// @desc    Place a new Order from Cart
// @route   POST /api/v1/orders
// @access  Private (Customer)
const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { deliveryAddress, paymentMethod } = req.body;

    // 1. Get user cart with product details
    const cart = await Cart.findOne({ userId }).populate('items.productId', 'name stockQuantity');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Aapka cart khali hai. Pehle kuch items add karein.' });
    }

    const store = await Store.findById(cart.storeId);
    
    // 2. Format items for Order snapshot
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      name: item.productId.name,
      quantity: item.quantity,
      price: item.price
    }));

    const itemTotal = parseFloat(cart.totalAmount.toString());
    const deliveryFee = parseFloat(store.deliveryFee.toString()) || 0;
    const totalAmount = itemTotal + deliveryFee;

    // 3. Create the Order
    const order = await Order.create({
      userId,
      storeId: store._id,
      vendorId: store.vendorId,
      items: orderItems,
      deliveryAddress,
      itemTotal,
      deliveryFee,
      totalAmount,
      paymentMethod
    });

    // 4. Clear the cart completely so customer can order from another store later
    cart.items = [];
    cart.storeId = null;
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({ status: 'success', message: 'Order placed successfully!', data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToCart, getCart, placeOrder };
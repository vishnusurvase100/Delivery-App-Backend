const Order = require('../models/Order');
const Store = require('../models/Store');
const DeliveryPartner = require('../models/DeliveryPartner');

// @desc    Auto-assign an order to the nearest available delivery partner
// @route   POST /api/v1/dispatch/:orderId/auto-assign
// @access  Private (Admin or System Trigger)
const autoAssignOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // 1. Order aur Store ki details nikalo
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'pending' && order.orderStatus !== 'ready_for_pickup') {
      return res.status(400).json({ message: 'Yeh order abhi assign karne ke status mein nahi hai.' });
    }

    const store = await Store.findById(order.storeId);
    if (!store || !store.coordinates || store.coordinates.length === 0) {
      return res.status(400).json({ message: 'Store ki location system mein nahi hai.' });
    }

    const [storeLongitude, storeLatitude] = store.coordinates;

    // dispatchController.js mein DeliveryPartner.findOne ko isse replace karo:

    // 2. MAGICAL GEOSPATIAL QUERY 🔥
    const nearestPartner = await DeliveryPartner.findOne({
      userId: { $nin: order.rejectedBy || [] }, // <-- NAYA LOGIC: Rejected riders ko ignore karo
      isLive: true,
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [storeLongitude, storeLatitude],
          },
          $maxDistance: 5000, 
        },
      },
    });
    // 3. Agar koi rider free nahi hai
    if (!nearestPartner) {
      return res.status(404).json({ 
        status: 'failed', 
        message: 'Abhi aas-paas koi delivery partner available nahi hai. Thodi der baad auto-retry hoga.' 
      });
    }

    // 4. BINGO! Rider mil gaya. Ab dono (Order aur Rider) ko update karo.
    
    // Order update karo
    order.deliveryPartnerId = nearestPartner.userId;
    order.orderStatus = 'assigned_to_delivery_partner';
    await order.save();

    // Rider ko busy (unavailable) karo taaki usko aur orders na milen
    nearestPartner.isAvailable = false;
    nearestPartner.currentOrderId = order._id;
    await nearestPartner.save();

    res.status(200).json({
      status: 'success',
      message: 'Order successfully assigned to the nearest partner!',
      data: {
        orderId: order._id,
        partnerId: nearestPartner.userId,
        vehicle: nearestPartner.vehicleNumber
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { autoAssignOrder };
const Order = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");
const Settlement = require("../models/Settlement");
const User = require("../models/User"); // Need this to fetch the fcmToken
const admin = require("../config/firebase"); // Add Firebase Admin at the top

// @desc    Accept or Reject Assigned Order
// @route   POST /api/v1/delivery/orders/:orderId/respond
// @access  Private (Delivery Partner)
const respondToOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { response } = req.body; // Expected: 'accept' or 'reject'
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.deliveryPartnerId?.toString() !== userId.toString()) {
      return res.status(403).json({ message: "This order has already been assigned to someone else." });
    }

    if (response === "reject") {
      // 1. Rider rejected: Blacklist this rider for this specific order
      order.rejectedBy.push(userId);
      order.deliveryPartnerId = null;
      order.orderStatus = "pending"; // Revert to pending for auto-reassignment
      await order.save();

      // 2. Free up the rider (make available) to receive other orders
      await DeliveryPartner.findOneAndUpdate(
        { userId },
        { isAvailable: true, currentOrderId: null }
      );

      return res.status(200).json({
        status: "success",
        message: "You have successfully rejected the order.",
      });
    }

    if (response === "accept") {
      order.orderStatus = "accepted_by_rider";
      await order.save();

      // Notify customer via Socket.io that rider has accepted
      const io = req.app.get("io");
      if (io) {
        io.to(order.userId.toString()).emit("orderStatusUpdated", {
          orderId: order._id,
          status: order.orderStatus,
          message: "A delivery partner has accepted your order and is heading to the restaurant!",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Order accepted successfully! Please head to the pickup point.",
      });
    }

    res.status(400).json({ message: "Response must be either 'accept' or 'reject'." });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Order Status (Pick Up / Deliver) & Process Settlements
// @route   PUT /api/v1/delivery/orders/:orderId/status
// @access  Private (Delivery Partner)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.deliveryPartnerId?.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized access to this order." });
    }

    order.orderStatus = status;
    await order.save();

    const orderMessage = `Your order is now ${order.orderStatus.replace(/_/g, " ")}!`;

    // ==========================================
    // 1. REAL-TIME NOTIFICATION (Socket.io - Foreground)
    // ==========================================
    const io = req.app.get("io");
    if (io) {
      io.to(order.userId.toString()).emit("orderStatusUpdated", {
        orderId: order._id,
        status: order.orderStatus,
        message: orderMessage,
      });
    }

    // ==========================================
    // 2. PUSH NOTIFICATION (FCM - Background/Killed)
    // ==========================================
    if (admin.apps.length > 0) { // Check if Firebase initialized successfully
      // Fetch the customer's FCM token from the database
      const customer = await User.findById(order.userId).select('fcmToken');
      
      if (customer && customer.fcmToken) {
        const payload = {
          token: customer.fcmToken,
          notification: {
            title: "Order Update 🍔",
            body: orderMessage,
          },
          data: {
            orderId: order._id.toString(), // Allows the app to open the specific order screen when tapped
            click_action: "FLUTTER_NOTIFICATION_CLICK" 
          }
        };

        // Send the notification asynchronously
        admin.messaging().send(payload)
          .then(response => console.log('Successfully sent push notification:', response))
          .catch(error => console.error('Error sending push notification:', error));
      }
    }
    // ==========================================

    // ==========================================
    // 3. SETTLEMENTS CALCULATION LOGIC
    // ==========================================
    if (status === "delivered") {
      // 1. Release the delivery partner for new orders
      await DeliveryPartner.findOneAndUpdate(
        { userId: userId },
        { isAvailable: true, currentOrderId: null }
      );

      // 2. Business Logic: Calculate payouts
      const platformCommissionRate = 0.1; // 10% platform commission on items
      const vendorCommissionDeduction = order.itemTotal * platformCommissionRate;
      const vendorPayout = order.itemTotal - vendorCommissionDeduction;

      // Rider gets the full delivery fee
      const riderPayout = order.deliveryFee;

      // 3. Generate Vendor Settlement Ledger Entry
      await Settlement.create({
        payeeId: order.vendorId,
        payeeRole: "vendor",
        orderId: order._id,
        amount: vendorPayout,
        commissionDeducted: vendorCommissionDeduction,
        status: "pending",
      });

      // 4. Generate Rider Settlement Ledger Entry
      await Settlement.create({
        payeeId: userId,
        payeeRole: "delivery_partner",
        orderId: order._id,
        amount: riderPayout,
        commissionDeducted: 0,
        status: "pending",
      });
    }

    res.status(200).json({
      status: "success",
      message: `Order successfully marked as ${status}!`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Emergency Transfer (Bike breakdown, accident, etc.)
// @route   POST /api/v1/delivery/orders/:orderId/emergency-transfer
// @access  Private (Delivery Partner)
const emergencyTransfer = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body; 
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.deliveryPartnerId?.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to modify this order." });
    }

    // 1. Remove current rider from the order and revert to 'pending' for auto-reassignment
    order.deliveryPartnerId = null;
    order.orderStatus = "pending";
    order.rejectedBy.push(userId); // Prevent this order from being assigned to the same rider again
    await order.save();

    // 2. Put the rider in Emergency Mode (Mark as offline)
    await DeliveryPartner.findOneAndUpdate(
      { userId },
      {
        isAvailable: false,
        isLive: false, // Rider will now appear offline on the app
        currentOrderId: null,
      }
    );

    // Notify customer about the delay via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(order.userId.toString()).emit("orderStatusUpdated", {
        orderId: order._id,
        status: order.orderStatus,
        message: "Your delivery partner faced an emergency. We are assigning a new partner immediately!",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Emergency recorded. Order reassigned to the network. Please take care of yourself!",
      reason,
    });
  } catch (error) {
    next(error);
  }
};

// Export all controller functions
module.exports = { respondToOrder, updateOrderStatus, emergencyTransfer };
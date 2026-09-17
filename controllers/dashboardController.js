const User = require('../models/User');
const Order = require('../models/Order');
const Settlement = require('../models/Settlement');

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Define 'Today' for daily metrics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 2. Execute all independent database queries concurrently using Promise.all for speed
    const [
      totalUsers,
      roleCounts,
      totalOrders,
      todayOrders,
      revenueStats,
      pendingSettlements
    ] = await Promise.all([
      // A. Total registered users
      User.countDocuments(),
      
      // B. User breakdown by role
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),

      // C. Total orders ever placed
      Order.countDocuments(),

      // D. Orders placed today
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),

      // E. Revenue Mathematics (Only counting 'delivered' orders)
      Order.aggregate([
        { $match: { orderStatus: 'delivered' } },
        { 
          $group: {
            _id: null,
            totalSalesVolume: { $sum: '$totalAmount' },
            // Assuming flat 10% platform commission on item totals
            totalPlatformProfit: { $sum: { $multiply: ['$itemTotal', 0.10] } } 
          }
        }
      ]),

      // F. Total money waiting to be paid out to vendors & riders
      Settlement.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, totalPendingPayout: { $sum: '$amount' } } }
      ])
    ]);

    // 3. Format the aggregated data nicely
    const formattedRoleCounts = roleCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const salesVolume = revenueStats[0]?.totalSalesVolume || 0;
    const platformProfit = revenueStats[0]?.totalPlatformProfit || 0;
    const pendingPayout = pendingSettlements[0]?.totalPendingPayout || 0;

    // 4. Send the final dashboard report
    res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          breakdown: formattedRoleCounts
        },
        orders: {
          total: totalOrders,
          today: todayOrders
        },
        financials: {
          totalSalesVolume: salesVolume,
          platformProfit: platformProfit,
          pendingPayouts: pendingPayout
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
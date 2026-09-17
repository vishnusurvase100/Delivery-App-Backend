const Settlement = require('../models/Settlement');

// @desc    Get all pending settlements (Filterable by payee role)
// @route   GET /api/v1/settlements/pending
// @access  Private (Admin)
const getPendingSettlements = async (req, res, next) => {
  try {
    const { role } = req.query; // Optional query filter: ?role=vendor or ?role=delivery_partner
    
    // Construct the query object
    const query = { status: 'pending' };
    if (role) {
      query.payeeRole = role;
    }

    // Fetch records and populate related user and order data
    const settlements = await Settlement.find(query)
      .populate('payeeId', 'fullName email phone') // Fetch payee details
      .populate('orderId', 'totalAmount createdAt') // Fetch order details
      .sort({ createdAt: 1 }); // Sort by oldest first

    res.status(200).json({
      status: 'success',
      count: settlements.length,
      data: settlements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a settlement as completed (Process Payout)
// @route   PUT /api/v1/settlements/:id/process
// @access  Private (Admin)
const processPayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transactionRef } = req.body; // Bank UTR or Transaction ID required

    // Validate if transaction reference is provided
    if (!transactionRef) {
      return res.status(400).json({ message: 'Transaction reference is required for payout.' });
    }

    // Find the settlement record
    const settlement = await Settlement.findById(id);
    
    if (!settlement) {
      return res.status(404).json({ message: 'Settlement record not found.' });
    }

    // Prevent double processing
    if (settlement.status === 'completed') {
      return res.status(400).json({ message: 'This settlement has already been processed.' });
    }

    // Update settlement status and details
    settlement.status = 'completed';
    settlement.transactionRef = transactionRef;
    settlement.settledAt = Date.now();

    await settlement.save();

    res.status(200).json({
      status: 'success',
      message: 'Payout processed successfully.',
      data: settlement
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPendingSettlements, processPayout };
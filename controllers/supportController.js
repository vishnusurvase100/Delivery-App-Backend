const SupportTicket = require('../models/SupportTicket');

// =======================
// USER/RIDER CONTROLLERS
// =======================

// @desc    Create a new support ticket
// @route   POST /api/v1/support
// @access  Private (All authenticated users)
const createTicket = async (req, res, next) => {
  try {
    const { orderId, issueType, subject, description } = req.body;
    
    // Create the ticket using the logged-in user's details
    const ticket = await SupportTicket.create({
      userId: req.user._id,
      userRole: req.user.role, // Automatically picks 'delivery_partner' if rider is logged in
      orderId,
      issueType,
      subject,
      description
    });

    res.status(201).json({
      status: 'success',
      message: 'Support ticket raised successfully. Our team will contact you soon.',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's support tickets
// @route   GET /api/v1/support/my-tickets
// @access  Private (All authenticated users)
const getMyTickets = async (req, res, next) => {
  try {
    // Fetch tickets only for the requesting user
    const tickets = await SupportTicket.find({ userId: req.user._id })
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      status: 'success',
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

// =======================
// ADMIN CONTROLLERS
// =======================

// @desc    Update ticket status & add admin response
// @route   PUT /api/v1/support/:id/respond
// @access  Private (Admin)
const respondToTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Update ticket fields
    if (status) ticket.status = status;
    if (adminResponse) ticket.adminResponse = adminResponse;

    await ticket.save();

    res.status(200).json({
      status: 'success',
      message: 'Ticket updated successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTicket, getMyTickets, respondToTicket };
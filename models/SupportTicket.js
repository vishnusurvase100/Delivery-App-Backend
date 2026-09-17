const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // The user raising the ticket
    },
    userRole: {
      type: String,
      enum: ['customer', 'vendor', 'delivery_partner'],
      required: true, // Identifies who raised the issue
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order', // Optional: If the issue is related to a specific order
    },
    issueType: {
      type: String,
      enum: ['payment', 'delivery', 'app_issue', 'customer_behavior', 'other'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open', // New tickets are always open
    },
    adminResponse: {
      type: String, // Admin's reply to the ticket
    }
  },
  { timestamps: true }
);

// Indexes for faster queries by user or ticket status
supportTicketSchema.index({ userId: 1, status: 1 });
supportTicketSchema.index({ status: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
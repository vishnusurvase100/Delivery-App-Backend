const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  accountHolderName: { 
    type: String, 
    required: true 
  },
  accountNumber: { 
    type: String, 
    required: true 
  },
  ifscCode: { 
    type: String, 
    required: true 
  },
  bankName: { 
    type: String, 
    required: true 
  },
  accountType: { 
    type: String, 
    enum: ['savings', 'current'], 
    default: 'savings' 
  }
}, { timestamps: true });

module.exports = mongoose.model('BankDetails', bankDetailsSchema);
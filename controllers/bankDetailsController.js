const BankDetails = require('../models/BankDetails');

// @desc    Add or Update Bank Details
// @route   POST /api/v1/bank-details
// @access  Private (Vendor & Delivery Partner)
const addOrUpdateBankDetails = async (req, res, next) => {
  try {
    const { accountHolderName, accountNumber, ifscCode, bankName, accountType } = req.body;
    const userId = req.user._id;

    // Check if details already exist
    let bankDetails = await BankDetails.findOne({ userId });

    if (bankDetails) {
      // Update existing details
      bankDetails.accountHolderName = accountHolderName || bankDetails.accountHolderName;
      bankDetails.accountNumber = accountNumber || bankDetails.accountNumber;
      bankDetails.ifscCode = ifscCode || bankDetails.ifscCode;
      bankDetails.bankName = bankName || bankDetails.bankName;
      bankDetails.accountType = accountType || bankDetails.accountType;
      
      await bankDetails.save();
      return res.status(200).json({ status: 'success', message: 'Bank details updated', data: bankDetails });
    } else {
      // Create new details
      bankDetails = await BankDetails.create({
        userId, accountHolderName, accountNumber, ifscCode, bankName, accountType
      });
      return res.status(201).json({ status: 'success', message: 'Bank details added', data: bankDetails });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User's Bank Details
// @route   GET /api/v1/bank-details
// @access  Private (Vendor & Delivery Partner)
const getBankDetails = async (req, res, next) => {
  try {
    const bankDetails = await BankDetails.findOne({ userId: req.user._id });
    
    if (!bankDetails) {
      return res.status(404).json({ message: "Bank details not found. Please add them." });
    }

    res.status(200).json({ status: 'success', data: bankDetails });
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrUpdateBankDetails, getBankDetails };
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // 👈 Naya import

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['customer', 'vendor', 'delivery_partner', 'admin'],
    },
    fcmToken: {
      type: String,
      default: null, // Stores the device token for push notifications
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      default: null,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'blocked', 'pending_verification'],
      default: 'active',
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    refreshTokenVersion: {
      type: Number,
      default: 1,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // 👇 Nayi fields forgot password ke liye
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// 👇 Naya method token generate karne ke liye
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins expiry
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
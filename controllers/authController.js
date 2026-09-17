const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // 👈 Naya import

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const registerUser = async (req, res, next) => {
  try {
    const { fullName, phone, email, password, role, fcmToken } = req.body;

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'User with this phone already exists' });
    }

    const user = await User.create({
      fullName,
      phone,
      email,
      passwordHash: password,
      role: role || 'customer',
      fcmToken: fcmToken || null,
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { phone, password, fcmToken } = req.body;
    const user = await User.findOne({ phone, isDeleted: false });

    if (user && (await user.matchPassword(password))) {
      user.lastLoginAt = new Date();
      if (fcmToken) user.fcmToken = fcmToken;
      await user.save();

      res.json({
        _id: user._id,
        fullName: user.fullName,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid phone or password' });
    }
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  res.json(req.user);
};

// 👇 Naya Forgot Password Controller
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ phone: req.body.phone });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with this phone number' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Token generated successfully. (In V2 this will be sent via SMS)',
      resetToken: resetToken, 
    });
  } catch (error) {
    next(error);
  }
};

// 👇 Naya Reset Password Controller
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.passwordHash = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getProfile, forgotPassword, resetPassword };
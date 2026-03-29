const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔐 Protect routes (authentication)
exports.protect = async (req, res, next) => {
  try {
    let token;

    // ✅ 1. Check Authorization header (MOST IMPORTANT)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // ✅ 2. Fallback to cookies (optional)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // ❌ No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // ✅ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Get user from DB
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // ✅ Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      // ✅ Attach full user object (IMPORTANT)
      req.user = user;

      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};


// 🔐 Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user?.role} is not authorized to access this route`
      });
    }

    next();
  };
};
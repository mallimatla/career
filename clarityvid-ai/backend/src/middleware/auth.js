const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT Secret - hardcoded for now until we properly configure Firebase Functions environment
const JWT_SECRET = 'clarityvid-secure-jwt-secret-key-2024-production';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    console.log('Auth middleware: Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth middleware: Token verified, user ID:', decoded.id);

    const user = await User.findById(decoded.id);

    if (!user) {
      console.log('Auth middleware: User not found for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    console.log('Auth middleware: User found:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message,
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

const checkCredits = async (req, res, next) => {
  try {
    const { Subscription } = require('../models');
    const subscription = await Subscription.findByUserId(req.user.id);

    if (!subscription || subscription.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    const availableCredits = subscription.credits - subscription.creditsUsed;

    if (availableCredits <= 0) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient credits. Please upgrade your plan or purchase additional credits.',
      });
    }

    req.subscription = subscription;
    req.availableCredits = availableCredits;
    next();
  } catch (error) {
    console.error('Check credits error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking credits',
      error: error.message,
    });
  }
};

module.exports = { protect, authorize, checkCredits };

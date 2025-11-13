const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is not active',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
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
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!subscription) {
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
    return res.status(500).json({
      success: false,
      message: 'Error checking credits',
      error: error.message,
    });
  }
};

module.exports = { protect, authorize, checkCredits };

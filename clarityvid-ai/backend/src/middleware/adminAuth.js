const jwt = require('jsonwebtoken');
const Admin = require('../models/firestore/Admin');

/**
 * Middleware to verify admin JWT token
 */
exports.verifyAdminToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET
    );

    // Check if admin exists
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Admin not found.',
      });
    }

    // Check if it's an admin role
    if (admin.role !== 'admin' && admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

/**
 * Middleware to check specific admin permissions
 */
exports.checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const admin = req.admin;

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Super admin or 'all' permission has access to everything
    if (admin.role === 'super_admin' || admin.permissions.includes('all')) {
      return next();
    }

    // Check if admin has required permission
    if (!admin.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required permission: ${requiredPermission}`,
      });
    }

    next();
  };
};

/**
 * Middleware to log admin actions
 */
exports.logAdminAction = async (req, res, next) => {
  try {
    const admin = req.admin;

    if (admin) {
      // Log action to Firestore
      const { db, Timestamp } = require('../config/firebase');

      await db.collection('adminLogs').add({
        adminId: admin.id,
        adminUsername: admin.username,
        action: `${req.method} ${req.path}`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        body: req.body,
        timestamp: Timestamp.now(),
      });
    }

    next();
  } catch (error) {
    // Don't block request if logging fails
    console.error('Error logging admin action:', error);
    next();
  }
};

module.exports = exports;

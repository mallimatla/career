const Admin = require('../models/firestore/Admin');
const Settings = require('../models/firestore/Settings');
const { db, Timestamp } = require('../config/firebase');

/**
 * Admin login
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    // Find admin
    const admin = await Admin.findByUsername(username);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Verify password
    const isPasswordValid = await Admin.verifyPassword(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Update last login
    await Admin.updateLastLogin(admin.id);

    // Generate token
    const token = Admin.generateToken(admin);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        admin: admin.toJSON(),
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login.',
      error: error.message,
    });
  }
};

/**
 * Get current admin profile
 */
exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.admin.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting profile.',
    });
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    // Verify current password
    const admin = await Admin.findById(req.admin.id);
    const isPasswordValid = await Admin.verifyPassword(currentPassword, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Update password
    await Admin.updatePassword(admin.id, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password.',
    });
  }
};

/**
 * Get all settings
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getGlobalSettings();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting settings.',
    });
  }
};

/**
 * Update pricing
 */
exports.updatePricing = async (req, res) => {
  try {
    const { pricing } = req.body;

    if (!pricing) {
      return res.status(400).json({
        success: false,
        message: 'Pricing data is required.',
      });
    }

    const settings = await Settings.updatePricing(pricing, req.admin.id);

    res.json({
      success: true,
      message: 'Pricing updated successfully.',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating pricing.',
    });
  }
};

/**
 * Update API keys
 */
exports.updateApiKeys = async (req, res) => {
  try {
    const { apiKeys } = req.body;

    if (!apiKeys) {
      return res.status(400).json({
        success: false,
        message: 'API keys data is required.',
      });
    }

    const settings = await Settings.updateApiKeys(apiKeys, req.admin.id);

    res.json({
      success: true,
      message: 'API keys updated successfully. Note: Actual secrets must be updated in environment variables.',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating API keys.',
    });
  }
};

/**
 * Update features
 */
exports.updateFeatures = async (req, res) => {
  try {
    const { features } = req.body;

    if (!features) {
      return res.status(400).json({
        success: false,
        message: 'Features data is required.',
      });
    }

    const settings = await Settings.updateFeatures(features, req.admin.id);

    res.json({
      success: true,
      message: 'Features updated successfully.',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating features.',
    });
  }
};

/**
 * Update email settings
 */
exports.updateEmailSettings = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email settings are required.',
      });
    }

    const settings = await Settings.updateEmailSettings(email, req.admin.id);

    res.json({
      success: true,
      message: 'Email settings updated successfully.',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating email settings.',
    });
  }
};

/**
 * Update limits
 */
exports.updateLimits = async (req, res) => {
  try {
    const { limits } = req.body;

    if (!limits) {
      return res.status(400).json({
        success: false,
        message: 'Limits data is required.',
      });
    }

    const settings = await Settings.updateLimits(limits, req.admin.id);

    res.json({
      success: true,
      message: 'Limits updated successfully.',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating limits.',
    });
  }
};

/**
 * Get platform statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    // Get user count
    const usersSnapshot = await db.collection('users').count().get();
    const totalUsers = usersSnapshot.data().count;

    // Get active subscriptions
    const activeSubsSnapshot = await db.collection('subscriptions')
      .where('status', '==', 'active')
      .count()
      .get();
    const activeSubscriptions = activeSubsSnapshot.data().count;

    // Get total videos
    const videosSnapshot = await db.collection('videos').count().get();
    const totalVideos = videosSnapshot.data().count;

    // Get total presentations
    const presentationsSnapshot = await db.collection('presentations').count().get();
    const totalPresentations = presentationsSnapshot.data().count;

    // Get total documents
    const documentsSnapshot = await db.collection('documents').count().get();
    const totalDocuments = documentsSnapshot.data().count;

    // Get total websites
    const websitesSnapshot = await db.collection('websites').count().get();
    const totalWebsites = websitesSnapshot.data().count;

    // Get revenue (from active subscriptions)
    const subsSnapshot = await db.collection('subscriptions')
      .where('status', '==', 'active')
      .get();

    let totalRevenue = 0;
    subsSnapshot.forEach(doc => {
      const sub = doc.data();
      totalRevenue += sub.price || 0;
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          activeSubscriptions,
        },
        content: {
          videos: totalVideos,
          presentations: totalPresentations,
          documents: totalDocuments,
          websites: totalWebsites,
          total: totalVideos + totalPresentations + totalDocuments + totalWebsites,
        },
        revenue: {
          monthly: totalRevenue,
          currency: 'INR',
        },
      },
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting statistics.',
    });
  }
};

/**
 * Get recent admin logs
 */
exports.getAdminLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const logsSnapshot = await db.collection('adminLogs')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const logs = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting admin logs.',
    });
  }
};

/**
 * Get all users (with pagination)
 */
exports.getUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    let query = db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (offset > 0) {
      const lastDoc = await db.collection('users')
        .orderBy('createdAt', 'desc')
        .offset(offset - 1)
        .limit(1)
        .get();

      if (!lastDoc.empty) {
        query = query.startAfter(lastDoc.docs[0]);
      }
    }

    const snapshot = await query.get();

    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      delete data.password; // Don't send passwords
      return { id: doc.id, ...data };
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting users.',
    });
  }
};

module.exports = exports;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdminToken, checkPermission, logAdminAction } = require('../middleware/adminAuth');

// Public routes
router.post('/login', adminController.login);

// Protected routes (require admin authentication)
router.use(verifyAdminToken);
router.use(logAdminAction);

// Admin profile
router.get('/profile', adminController.getProfile);
router.post('/change-password', adminController.changePassword);

// Settings management
router.get('/settings', adminController.getSettings);
router.put('/settings/pricing', checkPermission('manage_pricing'), adminController.updatePricing);
router.put('/settings/api-keys', checkPermission('manage_api_keys'), adminController.updateApiKeys);
router.put('/settings/features', checkPermission('manage_features'), adminController.updateFeatures);
router.put('/settings/email', checkPermission('manage_email'), adminController.updateEmailSettings);
router.put('/settings/limits', checkPermission('manage_limits'), adminController.updateLimits);

// Statistics & Analytics
router.get('/statistics', adminController.getStatistics);

// Admin logs
router.get('/logs', checkPermission('view_logs'), adminController.getAdminLogs);

// User management
router.get('/users', checkPermission('manage_users'), adminController.getUsers);

module.exports = router;

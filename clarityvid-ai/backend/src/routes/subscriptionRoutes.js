const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Routes
router.get('/plans', subscriptionController.getPlans);
router.get('/current', protect, subscriptionController.getCurrentSubscription);
router.post('/checkout', protect, subscriptionController.createCheckoutSession);
router.post('/cancel', protect, subscriptionController.cancelSubscription);

// Stripe webhook (raw body required)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionController.handleWebhook
);

module.exports = router;

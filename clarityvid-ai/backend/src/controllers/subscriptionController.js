const { Subscription } = require('../models');
// Payment processing is handled by razorpayController.js

// Pricing plans
const PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    credits: 1,
    features: {
      maxVideos: 3,
      maxDuration: 2,
      watermark: true,
      customBranding: false,
      apiAccess: false,
      teamMembers: 1,
      supportLevel: 'community',
    },
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 23,
    credits: 10,
    features: {
      maxVideos: 10,
      maxDuration: 5,
      watermark: false,
      customBranding: false,
      apiAccess: false,
      teamMembers: 1,
      supportLevel: 'email',
    },
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 79,
    annualPrice: 63,
    credits: 30,
    features: {
      maxVideos: 30,
      maxDuration: 15,
      watermark: false,
      customBranding: true,
      apiAccess: false,
      teamMembers: 3,
      supportLevel: 'priority',
    },
  },
  business: {
    name: 'Business',
    monthlyPrice: 149,
    annualPrice: 119,
    credits: 100,
    features: {
      maxVideos: 100,
      maxDuration: 60,
      watermark: false,
      customBranding: true,
      apiAccess: true,
      teamMembers: 10,
      supportLevel: 'dedicated',
    },
  },
  agency: {
    name: 'Agency',
    monthlyPrice: 299,
    annualPrice: 239,
    credits: 500,
    features: {
      maxVideos: 500,
      maxDuration: 60,
      watermark: false,
      customBranding: true,
      apiAccess: true,
      teamMembers: 50,
      supportLevel: 'dedicated',
      whiteLabel: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 0,
    annualPrice: 0,
    credits: 99999,
    features: {
      maxVideos: 999999,
      maxDuration: 120,
      watermark: false,
      customBranding: true,
      apiAccess: true,
      teamMembers: 999,
      supportLevel: '24/7',
      whiteLabel: true,
      customIntegration: true,
      sla: true,
    },
  },
};

// @desc    Get all available plans
// @route   GET /api/subscriptions/plans
// @access  Public
exports.getPlans = (req, res) => {
  res.json({
    success: true,
    plans: PLANS,
  });
};

// @desc    Get user's subscription
// @route   GET /api/subscriptions/current
// @access  Private
exports.getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByUserId(req.user.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found',
      });
    }

    const availableCredits = subscription.credits - subscription.creditsUsed;

    res.json({
      success: true,
      subscription: {
        ...subscription,
        availableCredits,
        planDetails: PLANS[subscription.plan],
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message,
    });
  }
};

// @desc    Create checkout session
// @route   POST /api/subscriptions/checkout
// @access  Private
// NOTE: Payment processing moved to razorpayController.js
exports.createCheckoutSession = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Payment processing is handled by Razorpay. Use /api/razorpay/create-order endpoint instead.',
  });
};

// @desc    Handle payment webhook
// @route   POST /api/subscriptions/webhook
// @access  Public
// NOTE: Webhook handling moved to razorpayController.js
exports.handleWebhook = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Webhook handling is done by Razorpay. Use /api/razorpay/webhook endpoint instead.',
  });
};

// NOTE: Stripe-specific handlers removed - payment processing moved to razorpayController.js
// All payment webhooks and handlers are now in razorpayController.js

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
// NOTE: Subscription cancellation moved to razorpayController.js
exports.cancelSubscription = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Subscription cancellation is handled by Razorpay. Use /api/razorpay/cancel-subscription endpoint instead.',
  });
};

const Razorpay = require('razorpay');
const crypto = require('crypto');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Pricing plans (in INR)
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
    monthlyPrice: 2400, // ₹2,400 (~$29)
    annualPrice: 1900, // ₹1,900/month (~$23)
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
    monthlyPrice: 6500, // ₹6,500 (~$79)
    annualPrice: 5200, // ₹5,200/month (~$63)
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
    monthlyPrice: 12300, // ₹12,300 (~$149)
    annualPrice: 9800, // ₹9,800/month (~$119)
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
    monthlyPrice: 24700, // ₹24,700 (~$299)
    annualPrice: 19700, // ₹19,700/month (~$239)
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
    currency: 'INR',
  });
};

// @desc    Get user's subscription
// @route   GET /api/subscriptions/current
// @access  Private
exports.getCurrentSubscription = async (req, res) => {
  try {
    const subscriptionDoc = await db.collection('subscriptions')
      .where('userId', '==', req.user.uid)
      .limit(1)
      .get();

    if (subscriptionDoc.empty) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found',
      });
    }

    const subscription = subscriptionDoc.docs[0].data();
    const availableCredits = subscription.credits - (subscription.creditsUsed || 0);

    res.json({
      success: true,
      subscription: {
        ...subscription,
        id: subscriptionDoc.docs[0].id,
        availableCredits,
        planDetails: PLANS[subscription.plan],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message,
    });
  }
};

// @desc    Create Razorpay order
// @route   POST /api/subscriptions/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { plan, billingCycle } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected',
      });
    }

    const planDetails = PLANS[plan];
    const amount = billingCycle === 'annual'
      ? planDetails.annualPrice * 12
      : planDetails.monthlyPrice;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `order_${req.user.uid}_${Date.now()}`,
      notes: {
        userId: req.user.uid,
        plan,
        billingCycle,
      },
    });

    // Store order in Firestore
    await db.collection('orders').doc(order.id).set({
      orderId: order.id,
      userId: req.user.uid,
      plan,
      billingCycle,
      amount: amount,
      currency: 'INR',
      status: 'created',
      createdAt: new Date(),
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/subscriptions/verify-payment
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Get order details
    const orderDoc = await db.collection('orders').doc(razorpay_order_id).get();
    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const order = orderDoc.data();
    const planDetails = PLANS[order.plan];

    // Update order status
    await db.collection('orders').doc(razorpay_order_id).update({
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: 'completed',
      completedAt: new Date(),
    });

    // Create or update subscription
    const subscriptionRef = db.collection('subscriptions').doc();
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (order.billingCycle === 'annual' ? 12 : 1));

    await subscriptionRef.set({
      userId: req.user.uid,
      plan: order.plan,
      billingCycle: order.billingCycle,
      status: 'active',
      credits: planDetails.credits,
      creditsUsed: 0,
      monthlyCredits: planDetails.credits,
      price: order.amount,
      currency: 'INR',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      features: planDetails.features,
      createdAt: now,
      updatedAt: now,
    });

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: {
        plan: order.plan,
        credits: planDetails.credits,
      },
    });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};

// @desc    Handle Razorpay webhook
// @route   POST /api/subscriptions/webhook
// @access  Public (Razorpay)
exports.handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(req.body.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(req.body.payload.payment.entity);
        break;

      case 'subscription.charged':
        await handleSubscriptionCharged(req.body.payload.subscription.entity);
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Handle successful payment
const handlePaymentCaptured = async (payment) => {
  const orderId = payment.order_id;

  const orderDoc = await db.collection('orders').doc(orderId).get();
  if (!orderDoc.exists) return;

  const order = orderDoc.data();

  // Update subscription credits for renewal
  const subscriptionSnapshot = await db.collection('subscriptions')
    .where('userId', '==', order.userId)
    .where('razorpayOrderId', '==', orderId)
    .limit(1)
    .get();

  if (!subscriptionSnapshot.empty) {
    const subDoc = subscriptionSnapshot.docs[0];
    await subDoc.ref.update({
      credits: PLANS[order.plan].credits,
      creditsUsed: 0,
      updatedAt: new Date(),
    });
  }
};

// Handle failed payment
const handlePaymentFailed = async (payment) => {
  const orderId = payment.order_id;

  await db.collection('orders').doc(orderId).update({
    status: 'failed',
    failureReason: payment.error_description,
    updatedAt: new Date(),
  });

  // Update subscription status
  const subscriptionSnapshot = await db.collection('subscriptions')
    .where('razorpayOrderId', '==', orderId)
    .limit(1)
    .get();

  if (!subscriptionSnapshot.empty) {
    const subDoc = subscriptionSnapshot.docs[0];
    await subDoc.ref.update({
      status: 'past_due',
      updatedAt: new Date(),
    });
  }
};

// Handle subscription charged
const handleSubscriptionCharged = async (subscription) => {
  // Handle recurring subscription charge
  console.log('Subscription charged:', subscription);
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    const subscriptionSnapshot = await db.collection('subscriptions')
      .where('userId', '==', req.user.uid)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (subscriptionSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    const subDoc = subscriptionSnapshot.docs[0];
    await subDoc.ref.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message,
    });
  }
};

module.exports = {
  getPlans,
  getCurrentSubscription,
  createOrder,
  verifyPayment,
  handleWebhook,
  cancelSubscription,
};

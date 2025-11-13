const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Subscription } = require('../models');

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
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id },
    });

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
        ...subscription.toJSON(),
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

// @desc    Create checkout session
// @route   POST /api/subscriptions/checkout
// @access  Private
exports.createCheckoutSession = async (req, res) => {
  try {
    const { plan, billingCycle } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected',
      });
    }

    const planDetails = PLANS[plan];
    const price = billingCycle === 'annual' ? planDetails.annualPrice : planDetails.monthlyPrice;

    // Create or get Stripe customer
    let customer = null;
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id },
    });

    if (subscription && subscription.stripeCustomerId) {
      customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: {
          userId: req.user.id,
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `ClarityVid AI - ${planDetails.name}`,
              description: `${planDetails.credits} credits per ${billingCycle === 'annual' ? 'year' : 'month'}`,
            },
            unit_amount: price * 100,
            recurring: {
              interval: billingCycle === 'annual' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId: req.user.id,
        plan,
        billingCycle,
      },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating checkout session',
      error: error.message,
    });
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/subscriptions/webhook
// @access  Public (Stripe)
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// Handle checkout completed
const handleCheckoutCompleted = async (session) => {
  const { userId, plan, billingCycle } = session.metadata;

  const planDetails = PLANS[plan];
  const price = billingCycle === 'annual' ? planDetails.annualPrice : planDetails.monthlyPrice;

  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);

  await Subscription.update(
    {
      plan,
      billingCycle,
      status: 'active',
      credits: planDetails.credits,
      creditsUsed: 0,
      monthlyCredits: planDetails.credits,
      price,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      stripePriceId: stripeSubscription.items.data[0].price.id,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      features: planDetails.features,
    },
    {
      where: { userId },
    }
  );
};

// Handle subscription updated
const handleSubscriptionUpdated = async (subscription) => {
  await Subscription.update(
    {
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    {
      where: { stripeSubscriptionId: subscription.id },
    }
  );
};

// Handle subscription deleted
const handleSubscriptionDeleted = async (subscription) => {
  await Subscription.update(
    {
      status: 'expired',
      plan: 'free',
      credits: 1,
      monthlyCredits: 1,
    },
    {
      where: { stripeSubscriptionId: subscription.id },
    }
  );
};

// Handle successful payment
const handlePaymentSucceeded = async (invoice) => {
  const subscription = await Subscription.findOne({
    where: { stripeSubscriptionId: invoice.subscription },
  });

  if (subscription) {
    // Reset credits for new billing period
    await subscription.update({
      credits: subscription.monthlyCredits,
      creditsUsed: 0,
    });
  }
};

// Handle failed payment
const handlePaymentFailed = async (invoice) => {
  await Subscription.update(
    {
      status: 'past_due',
    },
    {
      where: { stripeSubscriptionId: invoice.subscription },
    }
  );
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await subscription.update({
      cancelAtPeriodEnd: true,
    });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message,
    });
  }
};

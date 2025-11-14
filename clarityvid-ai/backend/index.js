// Load environment variables first
require('dotenv').config();

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Initialize Firebase
require('./src/config/firebase');

// Create Express app
const app = express();

// Trust proxy - required for Firebase Cloud Functions
app.set('trust proxy', true);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ClarityVid AI API',
    version: '2.0.0',
  });
});

// API Routes (Firebase Hosting forwards /api/** with the /api prefix intact)
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/videos', require('./src/routes/videoRoutes'));
app.use('/api/subscriptions', require('./src/routes/subscriptionRoutes'));

// TODO: Add these routes when implemented
// app.use('/api/presentations', require('./src/routes/presentations'));
// app.use('/api/documents', require('./src/routes/documents'));
// app.use('/api/websites', require('./src/routes/websites'));
// app.use('/api/teams', require('./src/routes/teams'));
// app.use('/api/templates', require('./src/routes/templates'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Export Express app as Firebase Function
exports.api = functions.https.onRequest(app);

// Background Functions

/**
 * Clean up expired subscriptions
 */
exports.cleanupExpiredSubscriptions = functions.pubsub
  .schedule('0 0 * * *') // Run daily at midnight
  .onRun(async (context) => {
    const { db, Timestamp } = require('./src/config/firebase');

    const now = Timestamp.now();
    const expiredSnapshot = await db.collection('subscriptions')
      .where('currentPeriodEnd', '<', now)
      .where('status', '==', 'active')
      .get();

    const batch = db.batch();
    expiredSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'expired',
        updatedAt: now,
      });
    });

    await batch.commit();
    console.log(`Cleaned up ${expiredSnapshot.size} expired subscriptions`);
  });

/**
 * Reset monthly credits
 */
exports.resetMonthlyCredits = functions.pubsub
  .schedule('0 0 1 * *') // Run on first day of each month
  .onRun(async (context) => {
    const { db, Timestamp } = require('./src/config/firebase');

    const activeSnapshot = await db.collection('subscriptions')
      .where('status', '==', 'active')
      .get();

    const batch = db.batch();
    activeSnapshot.docs.forEach(doc => {
      const data = doc.data();
      batch.update(doc.ref, {
        creditsUsed: 0,
        credits: data.monthlyCredits,
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log(`Reset credits for ${activeSnapshot.size} subscriptions`);
  });

/**
 * Clean up old temporary files
 */
exports.cleanupTempFiles = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM
  .onRun(async (context) => {
    const { storage } = require('./src/config/firebase');

    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: 'temp/' });

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    let deletedCount = 0;
    for (const file of files) {
      const [metadata] = await file.getMetadata();
      const createdAt = new Date(metadata.timeCreated).getTime();

      if (createdAt < oneDayAgo) {
        await file.delete();
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} temporary files`);
  });

/**
 * Send email notifications for failed payments
 */
exports.notifyFailedPayments = functions.pubsub
  .schedule('0 10 * * *') // Run daily at 10 AM
  .onRun(async (context) => {
    const { db } = require('./src/config/firebase');

    const failedSnapshot = await db.collection('orders')
      .where('status', '==', 'failed')
      .where('notified', '==', false)
      .get();

    for (const doc of failedSnapshot.docs) {
      const order = doc.data();
      // Send email notification (implement email service)
      console.log(`Would send email notification for failed order: ${order.orderId}`);

      await doc.ref.update({ notified: true });
    }

    console.log(`Processed ${failedSnapshot.size} failed payment notifications`);
  });

// Firestore Triggers

/**
 * After user creation, send welcome email
 */
exports.onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const user = snap.data();
    console.log(`New user created: ${user.email}`);

    // Send welcome email (implement email service)
    // await sendWelcomeEmail(user.email, user.firstName);
  });

/**
 * After video creation, process video generation
 */
exports.onVideoCreate = functions.firestore
  .document('videos/{videoId}')
  .onCreate(async (snap, context) => {
    const video = snap.data();
    const videoId = context.params.videoId;

    console.log(`New video created: ${videoId}`);

    // Trigger video processing job
    // This would typically add the job to a queue (Bull/Redis)
    // For Firebase, you might use Cloud Tasks or process directly
  });

/**
 * Log subscription changes
 */
exports.onSubscriptionUpdate = functions.firestore
  .document('subscriptions/{subscriptionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== after.status) {
      console.log(`Subscription ${context.params.subscriptionId} status changed: ${before.status} -> ${after.status}`);
    }
  });

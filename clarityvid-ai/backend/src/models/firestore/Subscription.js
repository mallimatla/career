const { db, FieldValue, Timestamp } = require('../../config/firebase');

class Subscription {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.plan = data.plan;
    this.billingCycle = data.billingCycle || 'monthly';
    this.status = data.status;
    this.credits = data.credits;
    this.creditsUsed = data.creditsUsed || 0;
    this.monthlyCredits = data.monthlyCredits;
    this.price = data.price;
    this.currency = data.currency;
    this.razorpayOrderId = data.razorpayOrderId || null;
    this.razorpayPaymentId = data.razorpayPaymentId || null;
    this.razorpaySubscriptionId = data.razorpaySubscriptionId || null;
    this.currentPeriodStart = data.currentPeriodStart;
    this.currentPeriodEnd = data.currentPeriodEnd;
    this.cancelledAt = data.cancelledAt || null;
    this.features = data.features || {};
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  // Create subscription
  static async create(subscriptionData) {
    try {
      const subRef = db.collection('subscriptions').doc();

      const subscription = new Subscription({
        id: subRef.id,
        ...subscriptionData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await subRef.set(JSON.parse(JSON.stringify(subscription)));
      return subscription;
    } catch (error) {
      throw new Error('Error creating subscription: ' + error.message);
    }
  }

  // Find by user ID
  static async findByUserId(userId) {
    try {
      const snapshot = await db.collection('subscriptions')
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const data = snapshot.docs[0].data();
      return new Subscription({ id: snapshot.docs[0].id, ...data });
    } catch (error) {
      throw new Error('Error finding subscription: ' + error.message);
    }
  }

  // Find by ID
  static async findById(subscriptionId) {
    try {
      const doc = await db.collection('subscriptions').doc(subscriptionId).get();

      if (!doc.exists) {
        return null;
      }

      return new Subscription({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding subscription: ' + error.message);
    }
  }

  // Update subscription
  static async update(subscriptionId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await db.collection('subscriptions').doc(subscriptionId).update(updateData);
      return await this.findById(subscriptionId);
    } catch (error) {
      throw new Error('Error updating subscription: ' + error.message);
    }
  }

  // Deduct credits
  static async deductCredits(userId, creditsToDeduct) {
    try {
      const subscription = await this.findByUserId(userId);

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      const availableCredits = subscription.credits - subscription.creditsUsed;

      if (availableCredits < creditsToDeduct) {
        throw new Error('Insufficient credits');
      }

      await db.collection('subscriptions').doc(subscription.id).update({
        creditsUsed: FieldValue.increment(creditsToDeduct),
        updatedAt: Timestamp.now(),
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Check if user has enough credits
  static async hasEnoughCredits(userId, requiredCredits) {
    try {
      const subscription = await this.findByUserId(userId);

      if (!subscription) {
        return false;
      }

      const availableCredits = subscription.credits - subscription.creditsUsed;
      return availableCredits >= requiredCredits;
    } catch (error) {
      return false;
    }
  }

  // Get available credits
  static async getAvailableCredits(userId) {
    try {
      const subscription = await this.findByUserId(userId);

      if (!subscription) {
        return 0;
      }

      return subscription.credits - subscription.creditsUsed;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = Subscription;

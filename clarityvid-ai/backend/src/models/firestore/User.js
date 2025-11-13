const { db, FieldValue, Timestamp } = require('../../config/firebase');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.emailVerified = data.emailVerified || false;
    this.verificationToken = data.verificationToken || null;
    this.resetPasswordToken = data.resetPasswordToken || null;
    this.resetPasswordExpire = data.resetPasswordExpire || null;
    this.role = data.role || 'user';
    this.plan = data.plan || 'free';
    this.avatar = data.avatar || null;
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  // Hash password before saving
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Create a new user
  static async create(userData) {
    try {
      const userRef = db.collection('users').doc();

      // Hash password
      const hashedPassword = userData.password ? await this.hashPassword(userData.password) : null;

      const userDoc = {
        id: userRef.id,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        company: userData.company || null,
        emailVerified: false,
        verificationToken: userData.verificationToken || null,
        resetPasswordToken: null,
        resetPasswordExpire: null,
        role: 'user',
        plan: 'free',
        avatar: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await userRef.set(userDoc);

      // Create user object to return (without exposing password in return value)
      const user = new User(userDoc);

      // Create default subscription
      const subscriptionRef = db.collection('subscriptions').doc();
      await subscriptionRef.set({
        id: subscriptionRef.id,
        userId: user.id,
        plan: 'free',
        status: 'active',
        credits: 1,
        creditsUsed: 0,
        monthlyCredits: 1,
        price: 0,
        currency: 'INR',
        features: {
          maxVideos: 3,
          maxDuration: 2,
          watermark: true,
          customBranding: false,
          apiAccess: false,
          teamMembers: 1,
          supportLevel: 'community',
        },
        currentPeriodStart: Timestamp.now(),
        currentPeriodEnd: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return user;
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const snapshot = await db.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const userData = snapshot.docs[0].data();
      return new User({ id: snapshot.docs[0].id, ...userData });
    } catch (error) {
      throw new Error('Error finding user: ' + error.message);
    }
  }

  // Find user by ID
  static async findById(userId) {
    try {
      const doc = await db.collection('users').doc(userId).get();

      if (!doc.exists) {
        return null;
      }

      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding user: ' + error.message);
    }
  }

  // Update user
  static async update(userId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Hash password if being updated
      if (updates.password) {
        updateData.password = await this.hashPassword(updates.password);
      }

      await db.collection('users').doc(userId).update(updateData);

      return await this.findById(userId);
    } catch (error) {
      throw new Error('Error updating user: ' + error.message);
    }
  }

  // Delete user
  static async delete(userId) {
    try {
      await db.collection('users').doc(userId).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting user: ' + error.message);
    }
  }

  // Find user by verification token
  static async findByVerificationToken(token) {
    try {
      const snapshot = await db.collection('users')
        .where('verificationToken', '==', token)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const userData = snapshot.docs[0].data();
      return new User({ id: snapshot.docs[0].id, ...userData });
    } catch (error) {
      throw new Error('Error finding user: ' + error.message);
    }
  }

  // Find user by reset password token
  static async findByResetToken(token) {
    try {
      const snapshot = await db.collection('users')
        .where('resetPasswordToken', '==', token)
        .where('resetPasswordExpire', '>', Timestamp.now())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const userData = snapshot.docs[0].data();
      return new User({ id: snapshot.docs[0].id, ...userData });
    } catch (error) {
      throw new Error('Error finding user: ' + error.message);
    }
  }

  // Convert to JSON (remove password)
  toJSON() {
    const { password, verificationToken, resetPasswordToken, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;

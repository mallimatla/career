const bcrypt = require('bcryptjs');
const { db, FieldValue, Timestamp } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

/**
 * User Model for Firestore
 * Collection: users
 */
class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.company = data.company || null;
    this.role = data.role || 'user';
    this.isVerified = data.isVerified || false;
    this.verificationToken = data.verificationToken || null;
    this.resetPasswordToken = data.resetPasswordToken || null;
    this.resetPasswordExpire = data.resetPasswordExpire || null;
    this.lastLogin = data.lastLogin || null;
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  /**
   * Hash password before saving
   */
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  /**
   * Compare password
   */
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Convert to JSON (remove sensitive fields)
   */
  toJSON() {
    const data = { ...this };
    delete data.password;
    delete data.verificationToken;
    delete data.resetPasswordToken;
    delete data.resetPasswordExpire;
    return data;
  }

  /**
   * Convert to Firestore document
   */
  toFirestore() {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      company: this.company,
      role: this.role,
      isVerified: this.isVerified,
      verificationToken: this.verificationToken,
      resetPasswordToken: this.resetPasswordToken,
      resetPasswordExpire: this.resetPasswordExpire,
      lastLogin: this.lastLogin,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create a new user
   */
  static async create(userData) {
    const user = new User(userData);
    await user.hashPassword();

    const userRef = db.collection('users').doc(user.id);
    await userRef.set(user.toFirestore());

    return user;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const userDoc = await db.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return null;
    }

    return new User({ id: userDoc.id, ...userDoc.data() });
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const snapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    return new User({ id: userDoc.id, ...userDoc.data() });
  }

  /**
   * Find all users (with pagination)
   */
  static async findAll(options = {}) {
    const { limit = 100, startAfter = null, where = [] } = options;

    let query = db.collection('users').limit(limit);

    // Apply where conditions
    where.forEach(condition => {
      const [field, operator, value] = condition;
      query = query.where(field, operator, value);
    });

    // Apply pagination
    if (startAfter) {
      const lastDoc = await db.collection('users').doc(startAfter).get();
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => new User({ id: doc.id, ...doc.data() }));
  }

  /**
   * Update user
   */
  static async update(id, updateData) {
    const userRef = db.collection('users').doc(id);

    // Hash password if it's being updated
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    updateData.updatedAt = Timestamp.now();

    await userRef.update(updateData);

    return await User.findById(id);
  }

  /**
   * Delete user (soft delete - set status to 'deleted')
   */
  static async delete(id) {
    return await User.update(id, { status: 'deleted' });
  }

  /**
   * Hard delete user
   */
  static async hardDelete(id) {
    await db.collection('users').doc(id).delete();
    return true;
  }

  /**
   * Count users
   */
  static async count(where = []) {
    let query = db.collection('users');

    where.forEach(condition => {
      const [field, operator, value] = condition;
      query = query.where(field, operator, value);
    });

    const snapshot = await query.get();
    return snapshot.size;
  }

  /**
   * Find user by verification token
   */
  static async findByVerificationToken(token) {
    const snapshot = await db.collection('users')
      .where('verificationToken', '==', token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    return new User({ id: userDoc.id, ...userDoc.data() });
  }

  /**
   * Find user by reset password token
   */
  static async findByResetToken(token) {
    const now = Timestamp.now();

    const snapshot = await db.collection('users')
      .where('resetPasswordToken', '==', token)
      .where('resetPasswordExpire', '>', now)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    return new User({ id: userDoc.id, ...userDoc.data() });
  }
}

module.exports = User;

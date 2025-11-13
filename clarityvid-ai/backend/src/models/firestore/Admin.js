const { db, Timestamp } = require('../../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class Admin {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.password = data.password;
    this.email = data.email;
    this.role = data.role || 'admin';
    this.permissions = data.permissions || ['all'];
    this.lastLogin = data.lastLogin || null;
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  // Hash password
  static async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Create admin
  static async create(adminData) {
    try {
      const adminRef = db.collection('admins').doc();

      // Hash password
      if (adminData.password) {
        adminData.password = await this.hashPassword(adminData.password);
      }

      const admin = new Admin({
        id: adminRef.id,
        ...adminData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await adminRef.set(JSON.parse(JSON.stringify(admin)));
      return admin;
    } catch (error) {
      throw new Error('Error creating admin: ' + error.message);
    }
  }

  // Find by username
  static async findByUsername(username) {
    try {
      const snapshot = await db.collection('admins')
        .where('username', '==', username)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const data = snapshot.docs[0].data();
      return new Admin({ id: snapshot.docs[0].id, ...data });
    } catch (error) {
      throw new Error('Error finding admin: ' + error.message);
    }
  }

  // Find by ID
  static async findById(adminId) {
    try {
      const doc = await db.collection('admins').doc(adminId).get();

      if (!doc.exists) {
        return null;
      }

      return new Admin({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding admin: ' + error.message);
    }
  }

  // Update last login
  static async updateLastLogin(adminId) {
    try {
      await db.collection('admins').doc(adminId).update({
        lastLogin: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      throw new Error('Error updating last login: ' + error.message);
    }
  }

  // Update password
  static async updatePassword(adminId, newPassword) {
    try {
      const hashedPassword = await this.hashPassword(newPassword);
      await db.collection('admins').doc(adminId).update({
        password: hashedPassword,
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      throw new Error('Error updating password: ' + error.message);
    }
  }

  // Generate JWT token
  static generateToken(admin) {
    return jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions,
      },
      process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Convert to JSON (remove password)
  toJSON() {
    const { password, ...adminWithoutPassword } = this;
    return adminWithoutPassword;
  }
}

module.exports = Admin;

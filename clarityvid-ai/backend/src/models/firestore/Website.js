const { db, Timestamp } = require('../../config/firebase');

class Website {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.teamId = data.teamId || null;
    this.title = data.title;
    this.content = data.content;
    this.websiteType = data.websiteType;
    this.templateId = data.templateId;
    this.pages = data.pages || [];
    this.theme = data.theme || {};
    this.status = data.status; // 'draft', 'generating', 'completed', 'deployed', 'failed'
    this.fileUrls = data.fileUrls || {};
    this.deployedUrl = data.deployedUrl || null;
    this.previewUrl = data.previewUrl || null;
    this.customDomain = data.customDomain || null;
    this.creditsUsed = data.creditsUsed || 0;
    this.error = data.error || null;
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  // Create website
  static async create(websiteData) {
    try {
      const websiteRef = db.collection('websites').doc();

      const website = new Website({
        id: websiteRef.id,
        ...websiteData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await websiteRef.set(JSON.parse(JSON.stringify(website)));
      return website;
    } catch (error) {
      throw new Error('Error creating website: ' + error.message);
    }
  }

  // Find by ID
  static async findById(websiteId) {
    try {
      const doc = await db.collection('websites').doc(websiteId).get();

      if (!doc.exists) {
        return null;
      }

      return new Website({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding website: ' + error.message);
    }
  }

  // Find all websites by user
  static async findByUserId(userId, limit = 50) {
    try {
      const snapshot = await db.collection('websites')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => new Website({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error finding websites: ' + error.message);
    }
  }

  // Update website
  static async update(websiteId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await db.collection('websites').doc(websiteId).update(updateData);
      return await this.findById(websiteId);
    } catch (error) {
      throw new Error('Error updating website: ' + error.message);
    }
  }

  // Delete website
  static async delete(websiteId) {
    try {
      await db.collection('websites').doc(websiteId).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting website: ' + error.message);
    }
  }
}

module.exports = Website;

const { db, Timestamp } = require('../../config/firebase');

class Presentation {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.teamId = data.teamId || null;
    this.title = data.title;
    this.content = data.content;
    this.templateId = data.templateId;
    this.slides = data.slides || [];
    this.theme = data.theme || {};
    this.status = data.status; // 'draft', 'generating', 'completed', 'failed'
    this.fileUrls = data.fileUrls || {};
    this.previewUrl = data.previewUrl || null;
    this.slideCount = data.slideCount || 0;
    this.creditsUsed = data.creditsUsed || 0;
    this.error = data.error || null;
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  // Create presentation
  static async create(presentationData) {
    try {
      const presentationRef = db.collection('presentations').doc();

      const presentation = new Presentation({
        id: presentationRef.id,
        ...presentationData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await presentationRef.set(JSON.parse(JSON.stringify(presentation)));
      return presentation;
    } catch (error) {
      throw new Error('Error creating presentation: ' + error.message);
    }
  }

  // Find by ID
  static async findById(presentationId) {
    try {
      const doc = await db.collection('presentations').doc(presentationId).get();

      if (!doc.exists) {
        return null;
      }

      return new Presentation({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding presentation: ' + error.message);
    }
  }

  // Find all presentations by user
  static async findByUserId(userId, limit = 50) {
    try {
      const snapshot = await db.collection('presentations')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => new Presentation({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error finding presentations: ' + error.message);
    }
  }

  // Update presentation
  static async update(presentationId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await db.collection('presentations').doc(presentationId).update(updateData);
      return await this.findById(presentationId);
    } catch (error) {
      throw new Error('Error updating presentation: ' + error.message);
    }
  }

  // Delete presentation
  static async delete(presentationId) {
    try {
      await db.collection('presentations').doc(presentationId).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting presentation: ' + error.message);
    }
  }
}

module.exports = Presentation;

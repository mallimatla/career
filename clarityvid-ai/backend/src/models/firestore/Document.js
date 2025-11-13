const { db, Timestamp } = require('../../config/firebase');

class Document {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.teamId = data.teamId || null;
    this.title = data.title;
    this.content = data.content;
    this.documentType = data.documentType;
    this.templateId = data.templateId;
    this.sections = data.sections || [];
    this.theme = data.theme || {};
    this.status = data.status; // 'draft', 'generating', 'completed', 'failed'
    this.fileUrls = data.fileUrls || {};
    this.previewUrl = data.previewUrl || null;
    this.wordCount = data.wordCount || 0;
    this.pageCount = data.pageCount || 0;
    this.creditsUsed = data.creditsUsed || 0;
    this.error = data.error || null;
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  // Create document
  static async create(documentData) {
    try {
      const documentRef = db.collection('documents').doc();

      const document = new Document({
        id: documentRef.id,
        ...documentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await documentRef.set(JSON.parse(JSON.stringify(document)));
      return document;
    } catch (error) {
      throw new Error('Error creating document: ' + error.message);
    }
  }

  // Find by ID
  static async findById(documentId) {
    try {
      const doc = await db.collection('documents').doc(documentId).get();

      if (!doc.exists) {
        return null;
      }

      return new Document({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding document: ' + error.message);
    }
  }

  // Find all documents by user
  static async findByUserId(userId, limit = 50) {
    try {
      const snapshot = await db.collection('documents')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => new Document({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error finding documents: ' + error.message);
    }
  }

  // Update document
  static async update(documentId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await db.collection('documents').doc(documentId).update(updateData);
      return await this.findById(documentId);
    } catch (error) {
      throw new Error('Error updating document: ' + error.message);
    }
  }

  // Delete document
  static async delete(documentId) {
    try {
      await db.collection('documents').doc(documentId).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting document: ' + error.message);
    }
  }
}

module.exports = Document;

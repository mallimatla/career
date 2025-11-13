const { db, Timestamp } = require('../../config/firebase');

class Video {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.teamId = data.teamId || null;
    this.title = data.title;
    this.description = data.description || null;
    this.sourceFile = data.sourceFile || null;
    this.sourceText = data.sourceText || null;
    this.script = data.script || null;
    this.status = data.status; // 'draft', 'processing', 'completed', 'failed'
    this.videoUrl = data.videoUrl || null;
    this.thumbnailUrl = data.thumbnailUrl || null;
    this.duration = data.duration || 0;
    this.language = data.language || 'en';
    this.voiceType = data.voiceType || 'male';
    this.scenes = data.scenes || [];
    this.settings = data.settings || {};
    this.creditsUsed = data.creditsUsed || 0;
    this.error = data.error || null;
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  // Create video
  static async create(videoData) {
    try {
      const videoRef = db.collection('videos').doc();

      const video = new Video({
        id: videoRef.id,
        ...videoData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await videoRef.set(JSON.parse(JSON.stringify(video)));
      return video;
    } catch (error) {
      throw new Error('Error creating video: ' + error.message);
    }
  }

  // Find by ID
  static async findById(videoId) {
    try {
      const doc = await db.collection('videos').doc(videoId).get();

      if (!doc.exists) {
        return null;
      }

      return new Video({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding video: ' + error.message);
    }
  }

  // Find all videos by user
  static async findByUserId(userId, limit = 50) {
    try {
      const snapshot = await db.collection('videos')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => new Video({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error finding videos: ' + error.message);
    }
  }

  // Update video
  static async update(videoId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await db.collection('videos').doc(videoId).update(updateData);
      return await this.findById(videoId);
    } catch (error) {
      throw new Error('Error updating video: ' + error.message);
    }
  }

  // Delete video
  static async delete(videoId) {
    try {
      await db.collection('videos').doc(videoId).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting video: ' + error.message);
    }
  }

  // Find by team ID
  static async findByTeamId(teamId, limit = 50) {
    try {
      const snapshot = await db.collection('videos')
        .where('teamId', '==', teamId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => new Video({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error finding team videos: ' + error.message);
    }
  }
}

module.exports = Video;

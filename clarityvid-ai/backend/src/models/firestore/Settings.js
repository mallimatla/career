const { db, Timestamp, FieldValue } = require('../../config/firebase');

class Settings {
  constructor(data) {
    this.id = data.id || 'global';
    this.pricing = data.pricing || {};
    this.apiKeys = data.apiKeys || {};
    this.features = data.features || {};
    this.email = data.email || {};
    this.limits = data.limits || {};
    this.updatedAt = data.updatedAt || Timestamp.now();
    this.updatedBy = data.updatedBy || null;
  }

  // Get global settings
  static async getGlobalSettings() {
    try {
      const doc = await db.collection('settings').doc('global').get();

      if (!doc.exists) {
        // Create default settings
        return await this.createDefaultSettings();
      }

      return new Settings({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error getting settings: ' + error.message);
    }
  }

  // Create default settings
  static async createDefaultSettings() {
    try {
      const defaultSettings = new Settings({
        id: 'global',
        pricing: {
          free: {
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
            monthlyPrice: 2400,
            annualPrice: 1900,
            credits: 10,
            features: {
              maxVideos: 20,
              maxDuration: 5,
              watermark: false,
              customBranding: false,
              apiAccess: false,
              teamMembers: 1,
              supportLevel: 'email',
            },
          },
          professional: {
            monthlyPrice: 6500,
            annualPrice: 5200,
            credits: 50,
            features: {
              maxVideos: 100,
              maxDuration: 15,
              watermark: false,
              customBranding: true,
              apiAccess: true,
              teamMembers: 5,
              supportLevel: 'priority',
            },
          },
          business: {
            monthlyPrice: 12300,
            annualPrice: 9800,
            credits: 150,
            features: {
              maxVideos: 500,
              maxDuration: 30,
              watermark: false,
              customBranding: true,
              apiAccess: true,
              teamMembers: 20,
              supportLevel: 'priority',
            },
          },
          agency: {
            monthlyPrice: 24700,
            annualPrice: 19700,
            credits: 500,
            features: {
              maxVideos: -1,
              maxDuration: 60,
              watermark: false,
              customBranding: true,
              apiAccess: true,
              teamMembers: 100,
              supportLevel: 'dedicated',
            },
          },
        },
        apiKeys: {
          razorpay: {
            keyId: process.env.RAZORPAY_KEY_ID || '',
            keySecret: '••••••••', // Masked
            webhookSecret: '••••••••', // Masked
          },
          anthropic: {
            apiKey: '••••••••', // Masked
            model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
          },
          firebase: {
            projectId: process.env.FIREBASE_PROJECT_ID || '',
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
          },
        },
        features: {
          enableApiAccess: process.env.ENABLE_API_ACCESS === 'true',
          enableTeamFeatures: process.env.ENABLE_TEAM_FEATURES === 'true',
          enableWebhooks: process.env.ENABLE_WEBHOOKS === 'true',
          maintenanceMode: false,
        },
        email: {
          smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
          smtpPort: parseInt(process.env.SMTP_PORT) || 587,
          smtpUser: process.env.SMTP_USER || '',
          emailFrom: process.env.EMAIL_FROM || 'noreply@clarityvid.ai',
        },
        limits: {
          maxFileSize: 100, // MB
          maxVideoDuration: 60, // minutes
          rateLimitWindow: 15, // minutes
          rateLimitMaxRequests: 100,
        },
        updatedAt: Timestamp.now(),
        updatedBy: 'system',
      });

      await db.collection('settings').doc('global').set(JSON.parse(JSON.stringify(defaultSettings)));
      return defaultSettings;
    } catch (error) {
      throw new Error('Error creating default settings: ' + error.message);
    }
  }

  // Update pricing
  static async updatePricing(pricingData, adminId) {
    try {
      await db.collection('settings').doc('global').update({
        pricing: pricingData,
        updatedAt: Timestamp.now(),
        updatedBy: adminId,
      });

      return await this.getGlobalSettings();
    } catch (error) {
      throw new Error('Error updating pricing: ' + error.message);
    }
  }

  // Update API keys (with masking)
  static async updateApiKeys(apiKeysData, adminId) {
    try {
      // Don't store actual secrets in Firestore - they should be in environment variables
      // This is just for display/reference purposes
      const maskedApiKeys = JSON.parse(JSON.stringify(apiKeysData));

      // Mask sensitive data
      if (maskedApiKeys.razorpay?.keySecret) {
        maskedApiKeys.razorpay.keySecret = '••••••••';
      }
      if (maskedApiKeys.razorpay?.webhookSecret) {
        maskedApiKeys.razorpay.webhookSecret = '••••••••';
      }
      if (maskedApiKeys.anthropic?.apiKey) {
        maskedApiKeys.anthropic.apiKey = '••••••••';
      }

      await db.collection('settings').doc('global').update({
        apiKeys: maskedApiKeys,
        updatedAt: Timestamp.now(),
        updatedBy: adminId,
      });

      return await this.getGlobalSettings();
    } catch (error) {
      throw new Error('Error updating API keys: ' + error.message);
    }
  }

  // Update features
  static async updateFeatures(featuresData, adminId) {
    try {
      await db.collection('settings').doc('global').update({
        features: featuresData,
        updatedAt: Timestamp.now(),
        updatedBy: adminId,
      });

      return await this.getGlobalSettings();
    } catch (error) {
      throw new Error('Error updating features: ' + error.message);
    }
  }

  // Update email settings
  static async updateEmailSettings(emailData, adminId) {
    try {
      await db.collection('settings').doc('global').update({
        email: emailData,
        updatedAt: Timestamp.now(),
        updatedBy: adminId,
      });

      return await this.getGlobalSettings();
    } catch (error) {
      throw new Error('Error updating email settings: ' + error.message);
    }
  }

  // Update limits
  static async updateLimits(limitsData, adminId) {
    try {
      await db.collection('settings').doc('global').update({
        limits: limitsData,
        updatedAt: Timestamp.now(),
        updatedBy: adminId,
      });

      return await this.getGlobalSettings();
    } catch (error) {
      throw new Error('Error updating limits: ' + error.message);
    }
  }

  // Update specific setting
  static async updateSetting(path, value, adminId) {
    try {
      const updateData = {
        [path]: value,
        updatedAt: Timestamp.now(),
        updatedBy: adminId,
      };

      await db.collection('settings').doc('global').update(updateData);
      return await this.getGlobalSettings();
    } catch (error) {
      throw new Error('Error updating setting: ' + error.message);
    }
  }
}

module.exports = Settings;

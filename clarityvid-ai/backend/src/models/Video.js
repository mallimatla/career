const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'teams',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sourceType: {
    type: DataTypes.ENUM('pdf', 'docx', 'pptx', 'txt', 'markdown', 'text', 'url'),
    allowNull: false,
  },
  sourceFileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sourceText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  script: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Generated or edited script for the video',
  },
  storyboard: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of scenes with timestamps and visuals',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Video duration in seconds',
  },
  creditsUsed: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Credits consumed for this video',
  },
  status: {
    type: DataTypes.ENUM('draft', 'processing', 'completed', 'failed', 'queued'),
    defaultValue: 'draft',
  },
  processingProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  audioUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
  },
  voiceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  voiceGender: {
    type: DataTypes.ENUM('male', 'female', 'neutral'),
    defaultValue: 'neutral',
  },
  voiceSpeed: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.0,
    validate: {
      min: 0.5,
      max: 2.0,
    },
  },
  hasWatermark: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  customBranding: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Logo, colors, fonts',
  },
  resolution: {
    type: DataTypes.ENUM('720p', '1080p', '4K'),
    defaultValue: '1080p',
  },
  format: {
    type: DataTypes.ENUM('mp4', 'mov', 'webm'),
    defaultValue: 'mp4',
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'videos',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['teamId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = Video;

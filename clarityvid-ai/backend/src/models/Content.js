const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Presentation = sequelize.define('Presentation', {
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
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Source content for generation',
  },
  slides: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of slide objects with content and design',
  },
  templateId: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'modern-business',
  },
  theme: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Colors, fonts, and styling',
  },
  status: {
    type: DataTypes.ENUM('draft', 'generating', 'completed', 'failed'),
    defaultValue: 'draft',
  },
  format: {
    type: DataTypes.ENUM('pptx', 'pdf', 'html', 'google-slides'),
    defaultValue: 'pptx',
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  previewUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  slideCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  creditsUsed: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'presentations',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['teamId'] },
    { fields: ['status'] },
    { fields: ['templateId'] },
  ],
});

const Document = sequelize.define('Document', {
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  documentType: {
    type: DataTypes.ENUM('report', 'proposal', 'whitepaper', 'article', 'blog', 'guide', 'manual', 'resume', 'letter'),
    allowNull: false,
    defaultValue: 'report',
  },
  templateId: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'professional-doc',
  },
  styling: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Fonts, colors, layout preferences',
  },
  sections: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Document sections with headings and content',
  },
  status: {
    type: DataTypes.ENUM('draft', 'generating', 'completed', 'failed'),
    defaultValue: 'draft',
  },
  format: {
    type: DataTypes.ENUM('docx', 'pdf', 'html', 'markdown'),
    defaultValue: 'docx',
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  previewUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  wordCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  pageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  creditsUsed: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'documents',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['teamId'] },
    { fields: ['status'] },
    { fields: ['documentType'] },
  ],
});

const Website = sequelize.define('Website', {
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
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Source content for generation',
  },
  websiteType: {
    type: DataTypes.ENUM('landing', 'portfolio', 'business', 'blog', 'ecommerce', 'saas', 'agency', 'personal'),
    allowNull: false,
    defaultValue: 'landing',
  },
  templateId: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'modern-landing',
  },
  pages: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of page objects with routes and content',
  },
  theme: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Colors, fonts, layout settings',
  },
  status: {
    type: DataTypes.ENUM('draft', 'generating', 'completed', 'failed', 'published'),
    defaultValue: 'draft',
  },
  deploymentUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Published website URL',
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ZIP file download URL',
  },
  previewUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  pageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  creditsUsed: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  seoSettings: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  analytics: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'websites',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['teamId'] },
    { fields: ['status'] },
    { fields: ['websiteType'] },
    { fields: ['domain'] },
  ],
});

module.exports = { Presentation, Document, Website };

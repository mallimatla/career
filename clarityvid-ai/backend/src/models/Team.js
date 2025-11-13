const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  subscriptionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subscriptions',
      key: 'id',
    },
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  sharedCredits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended'),
    defaultValue: 'active',
  },
}, {
  tableName: 'teams',
  timestamps: true,
});

const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'editor', 'viewer'),
    defaultValue: 'editor',
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: {
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canInvite: false,
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'suspended'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'team_members',
  timestamps: true,
  indexes: [
    { fields: ['teamId', 'userId'], unique: true },
  ],
});

module.exports = { Team, TeamMember };

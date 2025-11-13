const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Subscription = sequelize.define('Subscription', {
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
  plan: {
    type: DataTypes.ENUM('free', 'starter', 'professional', 'business', 'agency', 'enterprise'),
    allowNull: false,
    defaultValue: 'free',
  },
  billingCycle: {
    type: DataTypes.ENUM('monthly', 'annual'),
    allowNull: false,
    defaultValue: 'monthly',
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'expired', 'past_due'),
    defaultValue: 'active',
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '1 credit = 1 minute of video',
  },
  creditsUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  monthlyCredits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Credits allocated per billing cycle',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stripePriceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currentPeriodStart: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  currentPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelAtPeriodEnd: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  trialEndsAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  features: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'JSON object with plan features',
  },
}, {
  tableName: 'subscriptions',
  timestamps: true,
});

module.exports = Subscription;

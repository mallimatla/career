const User = require('./User');
const Subscription = require('./Subscription');
const Video = require('./Video');
const { Team, TeamMember } = require('./Team');

// Define associations

// User <-> Subscription (One-to-One)
User.hasOne(Subscription, { foreignKey: 'userId', as: 'subscription' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Video (One-to-Many)
User.hasMany(Video, { foreignKey: 'userId', as: 'videos' });
Video.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Team <-> Video (One-to-Many)
Team.hasMany(Video, { foreignKey: 'teamId', as: 'videos' });
Video.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// User <-> Team (Owner)
User.hasMany(Team, { foreignKey: 'ownerId', as: 'ownedTeams' });
Team.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Team <-> TeamMember (One-to-Many)
Team.hasMany(TeamMember, { foreignKey: 'teamId', as: 'members' });
TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// User <-> TeamMember (Many-to-Many through TeamMember)
User.hasMany(TeamMember, { foreignKey: 'userId', as: 'teamMemberships' });
TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Team <-> Subscription
Team.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
Subscription.hasMany(Team, { foreignKey: 'subscriptionId', as: 'teams' });

module.exports = {
  User,
  Subscription,
  Video,
  Team,
  TeamMember,
};

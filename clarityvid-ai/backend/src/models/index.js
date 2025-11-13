// Export Firestore models
const User = require('./firestore/User');
const Subscription = require('./firestore/Subscription');
const Video = require('./firestore/Video');
const Team = require('./firestore/Team');
const Admin = require('./firestore/Admin');
const Document = require('./firestore/Document');
const Presentation = require('./firestore/Presentation');
const Website = require('./firestore/Website');
const Settings = require('./firestore/Settings');

module.exports = {
  User,
  Subscription,
  Video,
  Team,
  Admin,
  Document,
  Presentation,
  Website,
  Settings,
};

const sequelize = require('../config/database');
const User = require('./User');
const Sport = require('./Sport');
const Session = require('./Session');
const SessionPlayer = require('./SessionPlayer');

// Define associations

// User -> Sport (one-to-many: user creates sports)
User.hasMany(Sport, { foreignKey: 'createdBy', as: 'createdSports' });
Sport.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User -> Session (one-to-many: user creates sessions)
User.hasMany(Session, { foreignKey: 'createdBy', as: 'createdSessions' });
Session.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Sport -> Session (one-to-many: sport has many sessions)
Sport.hasMany(Session, { foreignKey: 'sportId', as: 'sessions' });
Session.belongsTo(Sport, { foreignKey: 'sportId', as: 'sport' });

// Session <-> User (many-to-many through SessionPlayer)
Session.belongsToMany(User, { 
  through: SessionPlayer, 
  foreignKey: 'sessionId', 
  as: 'players' 
});
User.belongsToMany(Session, { 
  through: SessionPlayer, 
  foreignKey: 'userId', 
  as: 'joinedSessions' 
});

// Direct associations for SessionPlayer
SessionPlayer.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });
SessionPlayer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Sport,
  Session,
  SessionPlayer
};

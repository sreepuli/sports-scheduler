const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionPlayer = sequelize.define('SessionPlayer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Sessions',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('joined', 'cancelled'),
    allowNull: false,
    defaultValue: 'joined'
  }
}, {
  timestamps: true
});

module.exports = SessionPlayer;

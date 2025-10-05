const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sportId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Sports',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled'),
    allowNull: false,
    defaultValue: 'active'
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Session;

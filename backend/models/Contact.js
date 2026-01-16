const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
  address: {
    type: DataTypes.TEXT,
  },
  phone: {
    type: DataTypes.STRING(50),
  },
  email: {
    type: DataTypes.STRING(100),
  },
  website: {
    type: DataTypes.STRING(100),
  },
  socialMedia: {
    type: DataTypes.TEXT,
    field: 'social_media',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'contacts',
  timestamps: true,
  underscored: true,
});

module.exports = Contact;

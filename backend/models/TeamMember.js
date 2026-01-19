const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeamMember = sequelize.define('TeamMember', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'image_url',
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
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
  tableName: 'team_members',
  timestamps: true,
  underscored: true,
});

module.exports = TeamMember;

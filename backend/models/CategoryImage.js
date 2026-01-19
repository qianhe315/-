const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoryImage = sequelize.define('CategoryImage', {
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'image_url',
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_primary',
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
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
  tableName: 'category_images',
  timestamps: true,
  underscored: true,
});

module.exports = CategoryImage;

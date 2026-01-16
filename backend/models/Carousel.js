const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carousel = sequelize.define('Carousel', {
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'title',
    comment: '轮播图标题'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: '轮播图描述'
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'image_url',
    comment: '轮播图图片路径'
  },
  button_text: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'button_text',
    comment: '按钮文本'
  },
  button_link: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'button_link',
    comment: '按钮链接'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'sort_order',
    comment: '排序顺序，数值越小越靠前'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
    comment: '是否激活'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'carousels',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Carousel;
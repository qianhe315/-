const sequelize = require('../config/database');

// Import all models
const Product = require('./Product');
const Category = require('./Category');
const ProductImage = require('./ProductImage');
const CategoryImage = require('./CategoryImage');
const CompanyInfo = require('./CompanyInfo');
const TeamMember = require('./TeamMember');
const ProductionProcess = require('./ProductionProcess');
const QualityCertification = require('./QualityCertification');
const Client = require('./Client');
const Contact = require('./Contact');
const StaticPage = require('./StaticPage');
const Media = require('./Media');
const Admin = require('./Admin');
// Temporarily remove Carousel model import to prevent Sequelize issues
// const Carousel = require('./Carousel');



// Define relationships
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'product_images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Category.hasMany(CategoryImage, { foreignKey: 'categoryId', as: 'category_images', onDelete: 'CASCADE' });
CategoryImage.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = {
  sequelize,
  Product,
  Category,
  ProductImage,
  CategoryImage,
  CompanyInfo,
  TeamMember,
  ProductionProcess,
  QualityCertification,
  Client,
  Contact,
  StaticPage,
  Media,
  Admin
};

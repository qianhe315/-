const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');

// Get all products with images
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      include: [{ model: ProductImage, as: 'product_images', order: [['sortOrder', 'ASC']] }],
      order: [['sortOrder', 'ASC']]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true, categoryId: req.params.categoryId },
      include: [{ model: ProductImage, as: 'product_images', order: [['sortOrder', 'ASC']] }],
      order: [['sortOrder', 'ASC']]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product with images
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductImage, as: 'product_images', order: [['sortOrder', 'ASC']] }]
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product with images
router.post('/', async (req, res) => {
  try {
    const { images, ...productData } = req.body;
    const product = await Product.create(productData);
    
    if (images && images.length > 0) {
      const productImages = images.map(image => ({
        ...image,
        productId: product.id
      }));
      await ProductImage.bulkCreate(productImages);
      
      // Reload product with images
      const productWithImages = await Product.findByPk(product.id, {
        include: [{ model: ProductImage, as: 'product_images', order: [['sortOrder', 'ASC']] }]
      });
      res.status(201).json(productWithImages);
    } else {
      res.status(201).json(product);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { images, ...productData } = req.body;
    const [updated] = await Product.update(productData, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      // Update images if provided
      if (images) {
        // Delete existing images
        await ProductImage.destroy({ where: { productId: req.params.id } });
        // Create new images
        const productImages = images.map(image => ({
          ...image,
          productId: req.params.id
        }));
        await ProductImage.bulkCreate(productImages);
      }
      
      const updatedProduct = await Product.findByPk(req.params.id, {
        include: [{ model: ProductImage, as: 'product_images', order: [['sortOrder', 'ASC']] }]
      });
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: 'Product deleted' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add product image
router.post('/:id/images', async (req, res) => {
  try {
    const image = await ProductImage.create({
      ...req.body,
      productId: req.params.id
    });
    res.status(201).json(image);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product image
router.delete('/images/:imageId', async (req, res) => {
  try {
    const deleted = await ProductImage.destroy({
      where: { id: req.params.imageId }
    });
    if (deleted) {
      res.json({ message: 'Image deleted' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

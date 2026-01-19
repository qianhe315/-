const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const CategoryImage = require('../models/CategoryImage');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      include: [{ model: CategoryImage, as: 'category_images', order: [['sortOrder', 'ASC']] }],
      order: [['sortOrder', 'ASC']]
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all categories (including inactive)
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: CategoryImage, as: 'category_images', order: [['sortOrder', 'ASC']] }],
      order: [['sortOrder', 'ASC']]
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: CategoryImage, as: 'category_images', order: [['sortOrder', 'ASC']] }]
    });
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create category with images
router.post('/', async (req, res) => {
  try {
    const { images, ...categoryData } = req.body;
    const category = await Category.create(categoryData);
    
    if (images && images.length > 0) {
      const categoryImages = images.map(image => ({
        ...image,
        categoryId: category.id
      }));
      await CategoryImage.bulkCreate(categoryImages);
      
      // Reload category with images
      const categoryWithImages = await Category.findByPk(category.id, {
        include: [{ model: CategoryImage, as: 'category_images', order: [['sortOrder', 'ASC']] }]
      });
      res.status(201).json(categoryWithImages);
    } else {
      res.status(201).json(category);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { images, ...categoryData } = req.body;
    const [updated] = await Category.update(categoryData, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      // Update images if provided
      if (images) {
        // Delete existing images
        await CategoryImage.destroy({ where: { categoryId: req.params.id } });
        // Create new images
        const categoryImages = images.map(image => ({
          ...image,
          categoryId: req.params.id
        }));
        await CategoryImage.bulkCreate(categoryImages);
      }
      
      const updatedCategory = await Category.findByPk(req.params.id, {
        include: [{ model: CategoryImage, as: 'category_images', order: [['sortOrder', 'ASC']] }]
      });
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: 'Category deleted' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

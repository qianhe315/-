const express = require('express');
const router = express.Router();
const StaticPage = require('../models/StaticPage');

// Get all static pages
router.get('/', async (req, res) => {
  try {
    const pages = await StaticPage.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get static page by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const page = await StaticPage.findOne({
      where: { isActive: true, slug: req.params.slug }
    });
    if (page) {
      res.json(page);
    } else {
      res.status(404).json({ message: 'Static page not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single static page
router.get('/:id', async (req, res) => {
  try {
    const page = await StaticPage.findByPk(req.params.id);
    if (page) {
      res.json(page);
    } else {
      res.status(404).json({ message: 'Static page not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create static page
router.post('/', async (req, res) => {
  try {
    const page = await StaticPage.create(req.body);
    res.status(201).json(page);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update static page
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await StaticPage.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedPage = await StaticPage.findByPk(req.params.id);
      res.json(updatedPage);
    } else {
      res.status(404).json({ message: 'Static page not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete static page
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await StaticPage.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: 'Static page deleted' });
    } else {
      res.status(404).json({ message: 'Static page not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

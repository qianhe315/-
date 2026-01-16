const express = require('express');
const router = express.Router();
const QualityCertification = require('../models/QualityCertification');

// Get all quality certifications
router.get('/', async (req, res) => {
  try {
    const certifications = await QualityCertification.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    res.json(certifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single quality certification
router.get('/:id', async (req, res) => {
  try {
    const certification = await QualityCertification.findByPk(req.params.id);
    if (certification) {
      res.json(certification);
    } else {
      res.status(404).json({ message: 'Quality certification not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create quality certification
router.post('/', async (req, res) => {
  try {
    const certification = await QualityCertification.create(req.body);
    res.status(201).json(certification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update quality certification
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await QualityCertification.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedCertification = await QualityCertification.findByPk(req.params.id);
      res.json(updatedCertification);
    } else {
      res.status(404).json({ message: 'Quality certification not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete quality certification
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await QualityCertification.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: 'Quality certification deleted' });
    } else {
      res.status(404).json({ message: 'Quality certification not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

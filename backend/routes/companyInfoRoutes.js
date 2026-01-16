const express = require('express');
const router = express.Router();
const CompanyInfo = require('../models/CompanyInfo');

// Get all company info (for admin management)
router.get('/', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(companyInfo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get company info by type
router.get('/type/:type', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findOne({
      where: { isActive: true, type: req.params.type }
    });
    if (companyInfo) {
      res.json(companyInfo);
    } else {
      res.status(404).json({ message: 'Company info not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single company info
router.get('/:id', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findByPk(req.params.id);
    if (companyInfo) {
      res.json(companyInfo);
    } else {
      res.status(404).json({ message: 'Company info not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create company info
router.post('/', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.create(req.body);
    res.status(201).json(companyInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update company info
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await CompanyInfo.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedCompanyInfo = await CompanyInfo.findByPk(req.params.id);
      res.json(updatedCompanyInfo);
    } else {
      res.status(404).json({ message: 'Company info not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete company info
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await CompanyInfo.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: 'Company info deleted' });
    } else {
      res.status(404).json({ message: 'Company info not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

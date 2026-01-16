const express = require('express');
const router = express.Router();
const ProductionProcess = require('../models/ProductionProcess');

// Get all production processes
router.get('/', async (req, res) => {
  try {
    const processes = await ProductionProcess.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    res.json(processes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single production process
router.get('/:id', async (req, res) => {
  try {
    const process = await ProductionProcess.findByPk(req.params.id);
    if (process) {
      res.json(process);
    } else {
      res.status(404).json({ message: 'Production process not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create production process
router.post('/', async (req, res) => {
  try {
    const process = await ProductionProcess.create(req.body);
    res.status(201).json(process);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update production process
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await ProductionProcess.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedProcess = await ProductionProcess.findByPk(req.params.id);
      res.json(updatedProcess);
    } else {
      res.status(404).json({ message: 'Production process not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete production process
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await ProductionProcess.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: 'Production process deleted' });
    } else {
      res.status(404).json({ message: 'Production process not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

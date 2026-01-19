const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');

// Get all team members
router.get('/', async (req, res) => {
  try {
    const teamMembers = await TeamMember.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    res.json(teamMembers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all team members (including inactive)
router.get('/all', async (req, res) => {
  try {
    const teamMembers = await TeamMember.findAll({
      order: [['sortOrder', 'ASC']]
    });
    res.json(teamMembers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single team member
router.get('/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findByPk(req.params.id);
    if (teamMember) {
      res.json(teamMember);
    } else {
      res.status(404).json({ message: 'Team member not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create team member
router.post('/', async (req, res) => {
  try {
    const teamMember = await TeamMember.create(req.body);
    res.status(201).json(teamMember);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update team member
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await TeamMember.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedTeamMember = await TeamMember.findByPk(req.params.id);
      res.json(updatedTeamMember);
    } else {
      res.status(404).json({ message: 'Team member not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete team member
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await TeamMember.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: 'Team member deleted' });
    } else {
      res.status(404).json({ message: 'Team member not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

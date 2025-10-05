const express = require('express');
const { Sport, User, Session } = require('../models');
const { authMiddleware, isAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /sports - Create new sport (admin only)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Sport name is required' });
    }

    // Check for duplicate sport name
    const existingSport = await Sport.findOne({ where: { name } });
    if (existingSport) {
      return res.status(400).json({ error: 'Sport with this name already exists' });
    }

    const sport = await Sport.create({
      name,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: 'Sport created successfully',
      sport: {
        id: sport.id,
        name: sport.name,
        createdBy: sport.createdBy
      }
    });
  } catch (error) {
    console.error('Create sport error:', error);
    res.status(500).json({ error: 'Server error while creating sport' });
  }
});

// GET /sports - List all sports
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sports = await Sport.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      sports
    });
  } catch (error) {
    console.error('Get sports error:', error);
    res.status(500).json({ error: 'Server error while fetching sports' });
  }
});

// PUT /sports/:id - Edit sport (admin only)
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Sport name is required' });
    }

    const sport = await Sport.findByPk(id);
    if (!sport) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    // Check for duplicate name (excluding current sport)
    const existingSport = await Sport.findOne({ 
      where: { 
        name,
        id: { [require('sequelize').Op.ne]: id }
      } 
    });
    if (existingSport) {
      return res.status(400).json({ error: 'Sport with this name already exists' });
    }

    // Check if any active sessions exist for this sport
    const activeSessions = await Session.count({
      where: { 
        sportId: id,
        status: 'active'
      }
    });

    if (activeSessions > 0) {
      return res.status(400).json({ 
        error: 'Cannot edit sport with active sessions. Cancel or complete sessions first.' 
      });
    }

    sport.name = name;
    await sport.save();

    res.json({
      message: 'Sport updated successfully',
      sport
    });
  } catch (error) {
    console.error('Update sport error:', error);
    res.status(500).json({ error: 'Server error while updating sport' });
  }
});

// DELETE /sports/:id - Delete sport (admin only)
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const sport = await Sport.findByPk(id);
    if (!sport) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    // Check if any active sessions exist for this sport
    const activeSessions = await Session.count({
      where: { 
        sportId: id,
        status: 'active'
      }
    });

    if (activeSessions > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete sport with active sessions. Cancel or complete sessions first.' 
      });
    }

    await sport.destroy();

    res.json({
      message: 'Sport deleted successfully'
    });
  } catch (error) {
    console.error('Delete sport error:', error);
    res.status(500).json({ error: 'Server error while deleting sport' });
  }
});

module.exports = router;

const express = require('express');
const { Session, Sport, sequelize } = require('../models');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /reports/sessions - Get session count within date range
router.get('/sessions', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const sessionCount = await Session.count({
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      }
    });

    res.json({
      startDate,
      endDate,
      sessionCount
    });
  } catch (error) {
    console.error('Get session reports error:', error);
    res.status(500).json({ error: 'Server error while fetching session reports' });
  }
});

// GET /reports/popular-sports - Get most popular sports
router.get('/popular-sports', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereClause = {};
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const popularSports = await Session.findAll({
      attributes: [
        'sportId',
        [sequelize.fn('COUNT', sequelize.col('Session.id')), 'sessionCount']
      ],
      where: whereClause,
      include: [
        {
          model: Sport,
          as: 'sport',
          attributes: ['id', 'name']
        }
      ],
      group: ['sportId', 'sport.id', 'sport.name'],
      order: [[sequelize.literal('sessionCount'), 'DESC']],
      raw: false
    });

    // Format the response
    const formattedSports = popularSports.map(item => ({
      sport: item.sport,
      sessionCount: parseInt(item.dataValues.sessionCount)
    }));

    res.json({
      popularSports: formattedSports,
      dateRange: startDate && endDate ? { startDate, endDate } : null
    });
  } catch (error) {
    console.error('Get popular sports error:', error);
    res.status(500).json({ error: 'Server error while fetching popular sports' });
  }
});

module.exports = router;

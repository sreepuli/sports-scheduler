const express = require('express');
const { Session, Sport, User, SessionPlayer } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// POST /sessions - Create new session
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sportId, date, venue, maxPlayers } = req.body;

    if (!sportId || !date || !venue) {
      return res.status(400).json({ error: 'Sport, date, and venue are required' });
    }

    // Validate date is in the future
    const sessionDate = new Date(date);
    const now = new Date();
    if (sessionDate <= now) {
      return res.status(400).json({ error: 'Session date must be in the future' });
    }

    // Verify sport exists
    const sport = await Sport.findByPk(sportId);
    if (!sport) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    // Check for overlapping sessions (same user, same date/time)
    const overlappingSessions = await Session.count({
      where: {
        createdBy: req.user.id,
        date: sessionDate,
        status: 'active'
      }
    });

    if (overlappingSessions > 0) {
      return res.status(400).json({ 
        error: 'You already have a session at this date and time' 
      });
    }

    const session = await Session.create({
      sportId,
      createdBy: req.user.id,
      date,
      venue,
      maxPlayers: maxPlayers || 10,
      status: 'active'
    });

    // Fetch complete session with associations
    const createdSession = await Session.findByPk(session.id, {
      include: [
        {
          model: Sport,
          as: 'sport',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Session created successfully',
      session: createdSession
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Server error while creating session' });
  }
});

// GET /sessions - List all available sessions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: {
        status: 'active',
        date: {
          [Op.gte]: new Date() // Only future sessions
        }
      },
      include: [
        {
          model: Sport,
          as: 'sport',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'players',
          attributes: ['id', 'name', 'email'],
          through: {
            where: { status: 'joined' },
            attributes: []
          }
        }
      ],
      order: [['date', 'ASC']]
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Server error while fetching sessions' });
  }
});

// GET /sessions/my - List user's created sessions
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: {
        createdBy: req.user.id
      },
      include: [
        {
          model: Sport,
          as: 'sport',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'players',
          attributes: ['id', 'name', 'email'],
          through: {
            where: { status: 'joined' },
            attributes: []
          }
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Get my sessions error:', error);
    res.status(500).json({ error: 'Server error while fetching your sessions' });
  }
});

// GET /sessions/joined - List user's joined sessions
router.get('/joined', authMiddleware, async (req, res) => {
  try {
    const sessionPlayers = await SessionPlayer.findAll({
      where: {
        userId: req.user.id,
        status: 'joined'
      },
      include: [
        {
          model: Session,
          as: 'session',
          include: [
            {
              model: Sport,
              as: 'sport',
              attributes: ['id', 'name']
            },
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const sessions = sessionPlayers.map(sp => sp.session);

    res.json({ sessions });
  } catch (error) {
    console.error('Get joined sessions error:', error);
    res.status(500).json({ error: 'Server error while fetching joined sessions' });
  }
});

// POST /sessions/:id/join - Join a session
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if session exists and is active
    const session = await Session.findByPk(id, {
      include: [{
        model: User,
        as: 'players',
        attributes: ['id'],
        through: {
          where: { status: 'joined' },
          attributes: []
        }
      }]
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Cannot join cancelled session' });
    }

    // Check if session is in the future
    const sessionDate = new Date(session.date);
    const now = new Date();
    if (sessionDate <= now) {
      return res.status(400).json({ error: 'Cannot join expired session' });
    }

    // Check if session is full
    const currentPlayerCount = session.players ? session.players.length : 0;
    if (currentPlayerCount >= session.maxPlayers) {
      return res.status(400).json({ error: 'Session is full' });
    }

    // Check if already joined
    const existingJoin = await SessionPlayer.findOne({
      where: {
        sessionId: id,
        userId: req.user.id
      }
    });

    if (existingJoin) {
      if (existingJoin.status === 'joined') {
        return res.status(400).json({ error: 'Already joined this session' });
      } else {
        // Rejoin if previously cancelled
        existingJoin.status = 'joined';
        await existingJoin.save();
        return res.json({ message: 'Rejoined session successfully' });
      }
    }

    // Create new session player entry
    await SessionPlayer.create({
      sessionId: id,
      userId: req.user.id,
      status: 'joined'
    });

    res.status(201).json({ message: 'Joined session successfully' });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Server error while joining session' });
  }
});

// POST /sessions/:id/leave - Leave a session
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if session exists
    const session = await Session.findByPk(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Cannot leave cancelled sessions
    if (session.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot leave cancelled session' });
    }

    // Check if user has joined
    const sessionPlayer = await SessionPlayer.findOne({
      where: {
        sessionId: id,
        userId: req.user.id,
        status: 'joined'
      }
    });

    if (!sessionPlayer) {
      return res.status(400).json({ error: 'You have not joined this session' });
    }

    // Remove from session
    sessionPlayer.status = 'left';
    await sessionPlayer.save();

    res.json({ message: 'Left session successfully' });
  } catch (error) {
    console.error('Leave session error:', error);
    res.status(500).json({ error: 'Server error while leaving session' });
  }
});

// PUT /sessions/:id/cancel - Cancel session (creator only)
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Validate cancellation reason
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Cancellation reason is required' });
    }

    const session = await Session.findByPk(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user is the creator
    if (session.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only session creator can cancel' });
    }

    if (session.status === 'cancelled') {
      return res.status(400).json({ error: 'Session already cancelled' });
    }

    session.status = 'cancelled';
    session.reason = reason.trim();
    await session.save();

    res.json({
      message: 'Session cancelled successfully',
      session
    });
  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({ error: 'Server error while cancelling session' });
  }
});

module.exports = router;

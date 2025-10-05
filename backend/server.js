const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const sportsRoutes = require('./routes/sports');
const sessionsRoutes = require('./routes/sessions');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/sports', sportsRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/reports', reportsRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sports Scheduler API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');

    // Sync database models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✓ Database models synchronized');

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

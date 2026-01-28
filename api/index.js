const express = require('express');
const path = require('path');
const connectMongo = require('../lib/db');

const apiRoutes = require('../routes/api');
const pageRoutes = require('../routes/pages');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware to ensure MongoDB connection on first request
app.use(async (req, res, next) => {
  try {
    await connectMongo();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).render('error', {
      error: 'Database connection failed'
    });
  }
});

// Routes
app.use('/api', apiRoutes);
app.use('/', pageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    error: 'Page not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', {
    error: 'Internal server error'
  });
});

module.exports = app;

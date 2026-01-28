require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');

const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pastebin-lite';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

/**
 * Connect to MongoDB and start server
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ MongoDB connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Pastebin Lite server running on http://localhost:${PORT}`);
      console.log(`✓ MongoDB URI: ${MONGO_URI}`);
      if (process.env.TEST_MODE === '1') {
        console.log('✓ Test mode enabled - using x-test-now-ms header for expiry logic');
      }
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();

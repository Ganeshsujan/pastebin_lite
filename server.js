/**
 * LOCAL DEVELOPMENT SERVER ONLY
 * This file is used only for local development with npm start
 * Vercel uses api/index.js for serverless deployment
 */
require('dotenv').config();
const app = require('./api');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pastebin-lite';

console.log('🚀 Starting Pastebin Lite (Local Development)');

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
      console.log(`✓ Server running on http://localhost:${PORT}`);
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
  console.log('\n✓ Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();


/**
 * MongoDB Connection Helper - Singleton pattern for serverless
 * Reuses connections across Lambda invocations
 */
const mongoose = require('mongoose');

let cachedConnection = null;

async function connectMongo() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pastebin-lite';

  try {
    const connection = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = connection;
    console.log('✓ MongoDB connected');
    return connection;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    cachedConnection = null;
    throw error;
  }
}

module.exports = connectMongo;

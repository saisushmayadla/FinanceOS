const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  // If already connected or connecting, return existing connection
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return mongoose.connection;
  }

  try {
    let uri = process.env.MONGO_URI;

    if (!uri) {
      console.log('⚠️  No MONGO_URI specified in environment variables.');
      console.log('⚡ Starting in-memory MongoDB instance for local testing/development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        if (!mongoMemoryServer) {
          mongoMemoryServer = await MongoMemoryServer.create();
        }
        uri = mongoMemoryServer.getUri();
        console.log(`✅ MongoMemoryServer started successfully at ${uri}`);
      } catch (memErr) {
        console.error('Failed to initialize in-memory MongoDB:', memErr.message);
        throw new Error('Please set MONGO_URI in server/.env with your MongoDB Atlas or local MongoDB connection string.');
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('Error during database disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };

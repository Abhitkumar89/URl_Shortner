import mongoose from 'mongoose';

/**
 * Establish a connection to MongoDB.
 * Exits the process on failure so the platform (Render) can restart cleanly.
 */
export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Check your environment variables.');
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

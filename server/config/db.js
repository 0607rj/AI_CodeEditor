// server/config/db.js
// MongoDB connection using Mongoose
// WHY: Centralizes DB config so connection logic isn't scattered across files.

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('⚠️ Continuing without MongoDB (Memory features will be disabled)');
  }
};

export default connectDB;

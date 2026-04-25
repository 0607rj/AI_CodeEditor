// server/server.js
// Express entry point
// WHY: Clean separation — loads env, connects DB, mounts routes, starts server.
// Body limit set to 50mb because entire codebases can be large when concatenated.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import analyzeRoutes from './routes/analyzeRoutes.js';
import explainRoutes from './routes/explainRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';

// Load environment variables from root .env
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api', analyzeRoutes);
app.use('/api', explainRoutes);
app.use('/api', memoryRoutes);

// ── Error Handler (must be last) ───────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Antigravity server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    // Start without DB if connection fails (AI features still work)
    app.listen(PORT, () => {
      console.log(`⚠️  Server running WITHOUT MongoDB on http://localhost:${PORT}`);
    });
  }
};

startServer();

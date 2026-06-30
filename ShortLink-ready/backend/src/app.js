import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import { redirect } from './controllers/linkController.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(express.json());

  // CORS — allow the configured frontend origin(s).
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.use(
    cors({
      origin(origin, cb) {
        // Allow same-origin / server-to-server / tools with no Origin header.
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );

  // Basic rate limiting on the API surface.
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  // API routes.
  app.use('/api/auth', apiLimiter, authRoutes);
  app.use('/api', apiLimiter, linkRoutes);

  // Public redirect — must be last so it doesn't shadow API/health routes.
  app.get('/:code', redirect);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

import express from 'express';
import cors from 'cors';
import machineRoutes from './routes/machineRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimit } from './middleware/rateLimit.js';
import { requestLogger } from './middleware/requestLogger.js';
import { securityHeaders } from './middleware/securityHeaders.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || '*'
    })
  );

  app.use(securityHeaders);
  app.use(rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 300)
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/machines', machineRoutes);
  app.use(errorHandler);

  return app;
}

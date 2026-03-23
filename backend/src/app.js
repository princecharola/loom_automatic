import express from 'express';
import cors from 'cors';
import machineRoutes from './routes/machineRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || '*'
    })
  );
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/machines', machineRoutes);
  app.use(errorHandler);

  return app;
}

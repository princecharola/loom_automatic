import 'dotenv/config';
import http from 'http';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { initializeSocket } from './config/socket.js';
import { startMaintenanceJobs } from './jobs/maintenanceJobs.js';
import { logger } from './utils/logger.js';
import { User } from './models/User.js';
import { hashPassword } from './utils/hash.js';

const port = Number(process.env.PORT || 4000);
const app = createApp();
const server = http.createServer(app);

async function ensureBootstrapAdmin() {
  if (process.env.BOOTSTRAP_ADMIN !== 'true') {
    return;
  }

  const email = process.env.ADMIN_EMAIL || 'admin@loomops.local';
  const password = process.env.ADMIN_PASSWORD || 'ChangeThisAdminPass123!';

  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      fullName: 'Platform Admin',
      email,
      role: 'ADMIN',
      passwordHash: hashPassword(password)
    });
    logger.warn('Bootstrap admin account created. Please rotate credentials immediately.', { email });
  }
}

async function startServer() {
  await connectDatabase();
  await ensureBootstrapAdmin();
  await initializeSocket(server, {
    clientOrigin: process.env.CLIENT_ORIGIN
  });
  startMaintenanceJobs();

  server.listen(port, () => {
    logger.info(`Backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server', { message: error.message });
  process.exit(1);
});

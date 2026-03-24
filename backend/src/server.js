import 'dotenv/config';
import http from 'http';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { initializeSocket } from './config/socket.js';
import { startDummyGenerator } from './services/dummyGenerator.js';

const port = Number(process.env.PORT || 4000);
const app = createApp();
const server = http.createServer(app);

async function startServer() {
  await connectDatabase();
  await initializeSocket(server, {
    clientOrigin: process.env.CLIENT_ORIGIN
  });

  startDummyGenerator();

  server.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});

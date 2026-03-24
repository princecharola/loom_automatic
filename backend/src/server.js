import 'dotenv/config';
import http from 'http';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { initSocket } from './config/socket.js';
import { startSimulation } from './services/simulationService.js';

const port = Number(process.env.PORT || 4000);

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  initSocket(server);

  server.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });

  if (process.env.SIMULATION_ENABLED === 'true') {
    startSimulation().catch((error) => {
      console.error('Simulation failed to start', error);
    });
  }
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap server', error);
  process.exit(1);
});

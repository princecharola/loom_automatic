import 'dotenv/config';
import mongoose from 'mongoose';
import { Machine } from '../models/Machine.js';

function randomUpdate(machine) {
  const randomStop = Math.random() < 0.2;
  const status = randomStop ? 'OFF' : 'ON';
  const speed = status === 'OFF' ? 0 : Math.floor(100 + Math.random() * 300);
  const temperature = Math.floor(35 + Math.random() * 60);

  return {
    ...machine,
    status,
    speed,
    temperature,
    lastUpdated: new Date()
  };
}

export async function startSimulation() {
  setInterval(async () => {
    const machines = await Machine.find({});

    for (const machine of machines) {
      const next = randomUpdate(machine.toObject());
      await Machine.findByIdAndUpdate(machine._id, next);
    }

    if (machines.length) {
      console.log(`Simulated ${machines.length} machine updates at ${new Date().toISOString()}`);
    }
  }, Number(process.env.SIMULATION_INTERVAL_MS || 5000));
}

if (process.argv[1]?.includes('simulationService.js')) {
  import('../config/db.js')
    .then(async ({ connectDatabase }) => {
      await connectDatabase();
      await startSimulation();
    })
    .catch((error) => {
      console.error(error);
      mongoose.connection.close();
      process.exit(1);
    });
}

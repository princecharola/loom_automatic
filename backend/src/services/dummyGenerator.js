import { Machine } from '../models/Machine.js';
import { getSocket } from '../config/socket.js';
import { maybeCreateAlerts } from './alertService.js';

function randomUpdate(machine) {
  const turnOff = Math.random() < 0.1;
  const status = turnOff ? 'off' : 'on';
  return {
    status,
    speed: status === 'off' ? 0 : Math.floor(60 + Math.random() * 80),
    temperature: Math.round((50 + Math.random() * 60) * 10) / 10
  };
}

export function startDummyGenerator() {
  const enabled = process.env.ENABLE_DUMMY_GENERATOR === 'true';
  if (!enabled) return;

  setInterval(async () => {
    const machines = await Machine.find().limit(10);
    const io = getSocket();

    await Promise.all(
      machines.map(async (machine) => {
        Object.assign(machine, randomUpdate(machine));
        await machine.save();
        io.emit('machine:update', machine);
        await maybeCreateAlerts(machine, io);
      })
    );
  }, Number(process.env.DUMMY_INTERVAL_MS || 5000));
}

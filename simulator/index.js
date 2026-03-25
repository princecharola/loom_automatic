import axios from 'axios';

const apiUrl = process.env.API_URL || 'http://localhost:5000/api/machines/data';
const machineCount = Number(process.env.MACHINE_COUNT || 6);
const intervalMs = Number(process.env.SEND_INTERVAL_MS || 4000);

const machineState = Array.from({ length: machineCount }).map((_, index) => ({
  machineId: `loom-${String(index + 1).padStart(2, '0')}`,
  baseline: 90 + Math.floor(Math.random() * 40),
  phase: 'running'
}));

function generateSpeed(state) {
  const failureChance = Math.random();
  if (failureChance < 0.06) {
    state.phase = 'error';
    return 0;
  }

  if (failureChance < 0.15) {
    state.phase = 'recovery';
    return Math.floor(Math.random() * 40) + 20;
  }

  state.phase = 'running';
  const jitter = Math.floor(Math.random() * 30) - 10;
  return Math.max(0, state.baseline + jitter);
}

async function sendReading(state) {
  const speed = generateSpeed(state);
  const status = speed === 0 ? 'error' : speed < 60 ? 'stopped' : 'running';

  const payload = {
    machineId: state.machineId,
    speed,
    status,
    timestamp: new Date().toISOString()
  };

  try {
    await axios.post(apiUrl, payload);
    console.log(`[SIMULATOR] ${state.machineId} | status=${status} speed=${speed}`);
  } catch (error) {
    console.error(`[SIMULATOR] Failed ${state.machineId}`, error.message);
  }
}

console.log(`Starting simulator for ${machineCount} machines. Sending data to ${apiUrl}`);

async function tick() {
  await Promise.all(machineState.map((state) => sendReading(state)));
}

tick();
setInterval(tick, intervalMs);

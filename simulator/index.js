import axios from 'axios';

const apiUrl = process.env.API_URL || 'http://localhost:4000/api/machines/data';
const machineId = process.env.MACHINE_ID || 'loom-01';

function randomSpeed() {
  const shouldStop = Math.random() < 0.15;
  if (shouldStop) {
    return 0;
  }

  return Math.floor(Math.random() * 100) + 60;
}

async function sendReading() {
  const speed = randomSpeed();
  const status = speed === 0 ? 'error' : 'running';

  const payload = {
    machineId,
    speed,
    status,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await axios.post(apiUrl, payload);
    console.log(`[SIMULATOR] Sent reading`, response.data.reading);
  } catch (error) {
    console.error('[SIMULATOR] Failed to send reading', error.message);
  }
}

console.log(`Starting simulator for ${machineId}. Sending data to ${apiUrl}`);
sendReading();
setInterval(sendReading, 5000);

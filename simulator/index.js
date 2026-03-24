import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:4000/api';
const email = process.env.SIM_USER_EMAIL || 'demo@loomops.com';
const password = process.env.SIM_USER_PASSWORD || 'password123';
const name = process.env.SIM_USER_NAME || 'Demo Operator';

const client = axios.create({ baseURL: API_BASE });

function randomMachineUpdate() {
  const stopped = Math.random() < 0.2;
  return {
    status: stopped ? 'OFF' : 'ON',
    speed: stopped ? 0 : Math.floor(80 + Math.random() * 260),
    temperature: Math.floor(30 + Math.random() * 70)
  };
}

async function getToken() {
  try {
    const login = await client.post('/auth/login', { email, password });
    return login.data.token;
  } catch {
    const signup = await client.post('/auth/signup', { name, email, password });
    return signup.data.token;
  }
}

async function ensureMachines(token) {
  const authClient = axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } });
  const existing = await authClient.get('/machines');
  if (existing.data.length) return { authClient, machines: existing.data };

  const defaults = ['Loom-A1', 'Loom-A2', 'Loom-B1'];
  const machines = [];
  for (const machineName of defaults) {
    const created = await authClient.post('/machines', {
      name: machineName,
      status: 'ON',
      speed: 120,
      temperature: 45
    });
    machines.push(created.data.machine);
  }

  return { authClient, machines };
}

async function simulate() {
  const token = await getToken();
  const { authClient, machines } = await ensureMachines(token);

  console.log(`[SIM] Running for ${machines.length} machines every 5s`);
  setInterval(async () => {
    for (const machine of machines) {
      const patch = randomMachineUpdate();
      await authClient.put(`/machines/${machine._id}`, patch);
    }
    console.log(`[SIM] Updated ${machines.length} machines at ${new Date().toISOString()}`);
  }, 5000);
}

simulate().catch((error) => {
  console.error('[SIM] failed', error.response?.data || error.message);
  process.exit(1);
});

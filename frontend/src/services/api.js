import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

export async function fetchMachines() {
  const { data } = await api.get('/machines');
  return data;
}

export async function addMachine(payload) {
  const { data } = await api.post('/machines', payload);
  return data;
}

export async function editMachine(machineId, payload) {
  const { data } = await api.put(`/machines/${machineId}`, payload);
  return data;
}

export async function removeMachine(machineId) {
  await api.delete(`/machines/${machineId}`);
}

export async function fetchSummary() {
  const { data } = await api.get('/machines/summary');
  return data;
}

export async function fetchAlerts() {
  const { data } = await api.get('/machines/alerts?limit=20');
  return data;
}

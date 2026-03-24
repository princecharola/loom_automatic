import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('loom_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function signup(payload) {
  const { data } = await api.post('/auth/signup', payload);
  return data;
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

export async function fetchDashboard() {
  const { data } = await api.get('/machines/summary');
  return data;
}

export async function fetchAlerts() {
  const { data } = await api.get('/machines/alerts/list?limit=20');
  return data;
}

export async function createMachine(payload) {
  const { data } = await api.post('/machines', payload);
  return data.machine;
}

export async function updateMachine(id, payload) {
  const { data } = await api.put(`/machines/${id}`, payload);
  return data.machine;
}

export async function deleteMachine(id) {
  await api.delete(`/machines/${id}`);
}

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

export async function fetchSummary() {
  const { data } = await api.get('/machines/summary');
  return data;
}

export async function fetchAlerts() {
  const { data } = await api.get('/machines/alerts?limit=20');
  return data;
}

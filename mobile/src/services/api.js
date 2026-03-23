const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function fetchMachineSummary() {
  const response = await fetch(`${API_URL}/machines/summary`);
  return response.json();
}

export async function fetchMachineAlerts() {
  const response = await fetch(`${API_URL}/machines/alerts?limit=20`);
  return response.json();
}

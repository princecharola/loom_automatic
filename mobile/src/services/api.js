import { Platform } from 'react-native';

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:4000/api`;

export async function fetchMachineSummary() {
  const response = await fetch(`${API_URL}/machines/summary`);
  return response.json();
}

export async function fetchMachineAlerts() {
  const response = await fetch(`${API_URL}/machines/alerts?limit=20`);
  return response.json();
}

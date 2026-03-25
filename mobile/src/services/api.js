import { Platform } from 'react-native';

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:5000/api`;

let authToken = '';
let cachedSummary = [];
let cachedAlerts = [];

function authHeaders() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function setMobileToken(token) {
  authToken = token;
}

export async function loginMobile(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchMachineSummary() {
  try {
    const data = await request('/machines/summary');
    cachedSummary = Array.isArray(data) ? data : data.items || [];
    return cachedSummary;
  } catch (error) {
    return cachedSummary;
  }
}

export async function fetchMachineAlerts() {
  try {
    const data = await request('/machines/alerts?limit=20');
    cachedAlerts = Array.isArray(data) ? data : data.items || [];
    return cachedAlerts;
  } catch (error) {
    return cachedAlerts;
  }
}

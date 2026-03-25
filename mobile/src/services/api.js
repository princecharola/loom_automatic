import { Platform } from 'react-native';

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:4000/api`;

async function request(path, options = {}, token) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';

    try {
      const errorPayload = await response.json();
      errorMessage = errorPayload.message || errorMessage;
    } catch (_error) {
      // no-op
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export async function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function fetchMachineSummary(token) {
  return request('/machines/summary', {}, token);
}

export async function fetchMachineAlerts(token) {
  return request('/machines/alerts?limit=20', {}, token);
}

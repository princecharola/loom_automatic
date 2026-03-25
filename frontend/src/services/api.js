const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthToken() {
  return localStorage.getItem('loom_token') || '';
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      errorMessage = data.message || errorMessage;
    } catch {
      // ignore JSON parse errors for plain-text/non-JSON responses
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function normalizeListResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data.items || [];
}

export async function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchMachines(query = '') {
  const data = await request(`/machines${query}`);
  return normalizeListResponse(data);
}

export async function addMachine(payload) {
  return request('/machines', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function editMachine(machineId, payload) {
  return request(`/machines/${machineId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function removeMachine(machineId) {
  return request(`/machines/${machineId}`, {
    method: 'DELETE'
  });
}

export async function fetchSummary() {
  return request('/machines/summary');
}

export async function fetchAlerts(query = '?limit=20') {
  const data = await request(`/machines/alerts${query}`);
  return normalizeListResponse(data);
}

export async function acknowledgeAlert(alertId) {
  return request(`/machines/alerts/${alertId}/acknowledge`, {
    method: 'PATCH'
  });
}

export async function resolveAlert(alertId) {
  return request(`/machines/alerts/${alertId}/resolve`, {
    method: 'PATCH'
  });
}

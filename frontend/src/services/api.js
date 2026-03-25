const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function fetchMachines() {
  return request('/machines');
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

export async function fetchAlerts() {
  return request('/machines/alerts?limit=20');
}

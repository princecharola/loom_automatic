const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json'
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

export async function fetchSummary() {
  return request('/machines/summary');
}

export async function fetchAlerts() {
  return request('/machines/alerts?limit=20');
}

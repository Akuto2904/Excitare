// Client/src/services/api.js
// Shared API helper for ALL client and admin services.

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

// IMPORTANT: this must match the key in your APIKey table (Frontend App).
const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * Low-level helper using fetch.
 * All other helpers (including "api.post") delegate to this.
 */
export async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY, // our key always wins
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  // No body (e.g., DELETE 204)
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * Default export that behaves like a very small subset of axios.
 * This lets existing code in authService.js keep using: api.post('/login', {...})
 */
const api = {
  get: (path, config = {}) =>
    apiRequest(path, {
      method: 'GET',
      ...(config || {}),
    }),

  post: (path, data, config = {}) =>
    apiRequest(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...(config || {}),
    }),

  put: (path, data, config = {}) =>
    apiRequest(path, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...(config || {}),
    }),

  delete: (path, config = {}) =>
    apiRequest(path, {
      method: 'DELETE',
      ...(config || {}),
    }),
};

export default api;
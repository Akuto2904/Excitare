// Base URL of backend API
const API_BASE = "http://localhost:5000/api";

// API key (Frontend App key)
const API_KEY = "bffbcfe48bc96482c981f390694ade0a21c454906f707d6871b72dd36437679e";

// Function to make API requests
export async function apiRequest(endpoint, options = {}) {
  // Send request to backend using fetch
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options, // allows extra options (e.g. POST later)
    headers: {
      "Content-Type": "application/json", // tells backend we are sending JSON
      "X-API-KEY": API_KEY, // required for authentication 
      ...options.headers, // allows overriding/adding headers if needed
    },
  });

  // If response is not OK (for exampple 404, 500), throw error
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  // Convert response to JSON and return it
  return response.json();
}
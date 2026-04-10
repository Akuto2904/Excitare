// Base URL of backend API
const API_BASE = "http://localhost:5000/api";

// API key (Frontend App key)
const API_KEY = "960592bc5ec27dd978493406c289a5b251d0da53f09907edb1e577eb9f13c1db";
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
// Create a new file for API utilities
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  fetch: (endpoint, options = {}) => {
    // Get the auth token from localStorage
    const token = localStorage.getItem('authToken');

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // This ensures cookies are sent with every request
      headers,
    });
  }
}; 
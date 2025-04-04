// Create a new file for API utilities
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  fetch: (endpoint, options = {}) => {
    return fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // This ensures cookies are sent with every request
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }
}; 
// API configuration 
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create a reusable fetch function with the right configuration
export const fetchWithBaseUrl = (endpoint, options = {}) => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
};

// Full URL helper 
export const getFullApiUrl = (path) => `${API_BASE_URL}${path}`; 
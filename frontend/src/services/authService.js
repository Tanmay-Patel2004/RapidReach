const API_URL = 'http://localhost:6000/api/auth';

export const loginWithEmailPassword = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    return { user: data };
  } catch (error) {
    return { error: error.message };
  }
};

export const register = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    return { user: data };
  } catch (error) {
    return { error: error.message };
  }
};

export const resetPassword = async (email) => {
  // Implement password reset functionality
  return { error: 'Not implemented' };
}; 
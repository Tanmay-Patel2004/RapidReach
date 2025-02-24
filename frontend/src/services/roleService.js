import { API_BASE_URL } from '../config/api';

const getUserRole = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user role');
    }
    
    const data = await response.json();
    return data.role;
  } catch (error) {
    console.error('❌ Error fetching user role:', error);
    throw error;
  }
};

const checkPermission = async (userId, permission) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}/permissions/${permission}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check permission');
    }
    
    const data = await response.json();
    return data.hasPermission;
  } catch (error) {
    console.error('❌ Error checking permission:', error);
    throw error;
  }
};

export { getUserRole, checkPermission }; 
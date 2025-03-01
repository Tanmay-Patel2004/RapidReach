import { logout } from '../store/slices/authSlice';

export const authMiddleware = (store) => (next) => (action) => {
  if (action.type === 'auth/loginSuccess') {
    // Store the token in localStorage
    localStorage.setItem('token', action.payload.token);
    // Store minimal user info
    localStorage.setItem('user', JSON.stringify({
      _id: action.payload._id,
      name: action.payload.name,
      email: action.payload.email,
      role_id: action.payload.role_id
    }));
  }

  if (action.type === 'auth/logout') {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return next(action);
};

// Helper function to check if token is expired
export const checkTokenExpiration = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp < Date.now() / 1000) {
      // Token is expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return false;
  }
};

// Helper function to get stored auth state
export const getStoredAuthState = () => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      return null;
    }

    return {
      user,
      token,
      isAuthenticated: true,
      loading: false,
      error: null,
      role: user.role_id,
      permissions: []  // Permissions will be fetched when needed
    };
  } catch (error) {
    console.error('Error getting stored auth state:', error);
    return null;
  }
};

// Helper function to handle auth errors
export const handleAuthError = (error, store) => {
  if (error.response && error.response.status === 401) {
    // Unauthorized - clear auth state
    store.dispatch(logout());
    return true;
  }
  return false;
}; 
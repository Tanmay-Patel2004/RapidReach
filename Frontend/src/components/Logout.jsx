import { api } from '../utils/api';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const handleLogout = async () => {
  try {
    await api.fetch('/auth/logout', {
      method: 'POST',
    });
    
    // Clear the redux store
    dispatch(logout());
    
    // Redirect to login
    navigate('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}; 
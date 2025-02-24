import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyToken, loginWithEmailPassword } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('admin'); // For testing, set a default role
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user info
      verifyToken(token)
        .then(userData => {
          setUser(userData);
          setUserRole(userData.role || 'admin'); // Set default role if none exists
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
          setUserRole(null);
        });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginWithEmailPassword(email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setUserRole(data.user.role || 'admin'); // Set default role if none exists
      navigate('/users');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setUserRole(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
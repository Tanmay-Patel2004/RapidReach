import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // You can add your authentication logic here
  // For now, let's just use a mock user
  useEffect(() => {
    // This is just for demonstration
    // Replace this with your actual authentication logic
    setUser({
      name: 'John Doe',
      email: 'john@example.com'
    });
  }, []);

  const value = {
    user,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,  // Will contain firstName, lastName, email, _id, role
  token: null,
  permissions: [],
  isAuthenticated: false,
  error: null,
  loading: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { _id, firstName, lastName, email, role_id, permissions, token } = action.payload;
      
      state.loading = false;
      state.isAuthenticated = true;
      state.user = { 
        _id, 
        firstName, 
        lastName, 
        email,
        role_id // Store the entire role object
      };
      state.token = token;
      state.permissions = permissions;
      state.error = null;
      
      // Save auth data to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ 
        _id, 
        firstName, 
        lastName, 
        email,
        role_id // Store the entire role object
      }));
      localStorage.setItem('permissions', JSON.stringify(permissions));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.permissions = [];
      
      // Clear localStorage on failure
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
    },
    logout: (state) => {
      // Clear all auth-related state
      state.user = null;
      state.token = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      
      // Clear localStorage
      localStorage.clear(); // Clear all storage instead of just auth items
      
      // You could also clear specific items if preferred:
      // localStorage.removeItem('authToken');
      // localStorage.removeItem('user');
      // localStorage.removeItem('permissions');
    },
    restoreAuthState: (state) => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      const permissions = localStorage.getItem('permissions');

      if (token && user && permissions) {
        state.isAuthenticated = true;
        state.token = token;
        state.user = JSON.parse(user);
        state.permissions = JSON.parse(permissions);
      }
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout,
  restoreAuthState 
} = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectPermissions = (state) => state.auth.permissions;
export const selectUserRole = (state) => state.auth.user?.role_id;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;

// Permission check helper
export const hasPermission = (state, permissionName) => {
  return state.auth.permissions.some(p => p.name === permissionName);
};

export default authSlice.reducer; 
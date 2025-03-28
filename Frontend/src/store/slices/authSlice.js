import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  role: null,
  permissions: [],
  token: null
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
      console.log("Login successful:", action);
      const responseData = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.error = null;
      
      // Extract user data from the response
      state.user = {
        _id: responseData._id,
        name: responseData.name,
        email: responseData.email,
        dateOfBirth: responseData.dateOfBirth,
        createdAt: responseData.createdAt,
        updatedAt: responseData.updatedAt,
        address: responseData.address || {},
        profilePicture: responseData.profilePicture,
        phoneNumber: responseData.phoneNumber,
        isEmailVerified: responseData.isEmailVerified
      };

      // Store the complete role object
      state.role = responseData.role_id;
      state.permissions = responseData.permissions;
      state.token = responseData.token;

      // Store auth state in localStorage
      localStorage.setItem('authState', JSON.stringify({
        user: state.user,
        isAuthenticated: true,
        role: state.role,
        permissions: state.permissions,
        token: state.token
      }));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.permissions = [];
      state.token = null;
      localStorage.removeItem('authState');
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      state.role = null;
      state.permissions = [];
      state.token = null;
      localStorage.removeItem('authState');
    },
    updateUserProfile: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload
      };
      // Update localStorage when profile is updated
      const authState = JSON.parse(localStorage.getItem('authState') || '{}');
      localStorage.setItem('authState', JSON.stringify({
        ...authState,
        user: state.user
      }));
    },
    clearError: (state) => {
      state.error = null;
    },
    restoreAuthState: (state, action) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.role = action.payload.role;
        state.permissions = action.payload.permissions || [];
        state.token = action.payload.token;
      }
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserProfile,
  clearError,
  restoreAuthState
} = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.role;
export const selectUserPermissions = (state) => state.auth.permissions;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthToken = (state) => state.auth.token;
export const selectToken = selectAuthToken;

// Additional role-specific selectors
export const selectRoleName = (state) => state.auth.role?.name;
export const selectRoleId = (state) => state.auth.role?._id;

export default authSlice.reducer; 
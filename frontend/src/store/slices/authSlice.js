import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  role: null,
  permissions: []
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
      const responseData = action.payload.data || action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.error = null;
      // Extract user data from the response
      state.user = {
        _id: responseData._id,
        name: responseData.name,
        email: responseData.email,
        // Only include these fields if they exist in the payload
        ...(responseData.profilePicture && { profilePicture: responseData.profilePicture }),
        ...(responseData.phoneNumber && { phoneNumber: responseData.phoneNumber }),
        ...(responseData.address && { address: responseData.address }),
        ...(responseData.isEmailVerified !== undefined && { isEmailVerified: responseData.isEmailVerified }),
        ...(responseData.dateOfBirth && { dateOfBirth: responseData.dateOfBirth })
      };
      // Store the complete role object from role_id
      state.role = responseData.role_id || null;
      state.permissions = responseData.permissions || [];

      // Store auth state in localStorage (excluding sensitive data)
      localStorage.setItem('authState', JSON.stringify({
        user: state.user,
        isAuthenticated: true,
        role: state.role,
        permissions: state.permissions
      }));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.permissions = [];
      // Clear localStorage on failure
      localStorage.removeItem('authState');
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      state.role = null;
      state.permissions = [];
      // Clear localStorage on logout
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
export const selectToken = selectAuthToken; // Alias for backward compatibility

// Additional role-specific selectors
export const selectRoleName = (state) => state.auth.role?.name;
export const selectRoleId = (state) => state.auth.role?._id;

export default authSlice.reducer; 
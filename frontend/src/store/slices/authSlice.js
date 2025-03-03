import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
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
      const responseData = action.payload.data || action.payload; // Handle both direct payload and nested data
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
      state.token = responseData.token;
      // Store the complete role object from role_id
      state.role = responseData.role_id || null;
      state.permissions = responseData.permissions || [];
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.role = null;
      state.permissions = [];
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      state.role = null;
      state.permissions = [];
    },
    updateUserProfile: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    restoreAuthState: (state, action) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
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
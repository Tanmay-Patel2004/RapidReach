import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Avatar,
  Button,
  TextField,
  Box,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { selectUser, selectAuthToken, updateUserProfile } from '../store/slices/authSlice';
import logger from '../utils/logger';

const ProfilePage = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectAuthToken);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth?.split('T')[0] || '',
    profilePicture: user?.profilePicture || '',
    address: {
      street: user?.address?.street || '',
      unitNumber: user?.address?.unitNumber || '',
      province: user?.address?.province || '',
      country: user?.address?.country || '',
      zipCode: user?.address?.zipCode || '',
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/users/upload-profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      setFormData(prev => ({ ...prev, profilePicture: result.data.url }));
      setSnackbar({
        open: true,
        message: 'Profile picture updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.message);
      logger.error('Profile picture upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/users/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch user data');
      }

      const result = await response.json();
      if (result.code === 200) {
        const userData = result.data;
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          dateOfBirth: userData.dateOfBirth?.split('T')[0] || '',
          profilePicture: userData.profilePicture || '',
          address: {
            street: userData.address?.street || '',
            unitNumber: userData.address?.unitNumber || '',
            province: userData.address?.province || '',
            country: userData.address?.country || '',
            zipCode: userData.address?.zipCode || '',
          }
        });
      }
    } catch (err) {
      setError(err.message);
      logger.error('Fetch user data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3000/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      if (result.code === 200) {
        dispatch(updateUserProfile(result.data));
        setIsEditing(false);
        setSnackbar({
          open: true,
          message: 'Profile updated successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      setError(err.message);
      logger.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id && token) {
      fetchUserData();
    }
  }, [user?._id, token]);

  return (
    <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Profile Picture Section */}
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={formData.profilePicture}
                alt={formData.name}
                sx={{
                  width: 200,
                  height: 200,
                  mb: 2,
                  border: '4px solid',
                  borderColor: 'primary.main',
                }}
              />
              {isEditing && (
                <input
                  accept="image/*"
                  type="file"
                  id="profile-picture-input"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              )}
              {isEditing && (
                <label htmlFor="profile-picture-input">
                  <IconButton
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </label>
              )}
            </Box>
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user?.role_id?.name?.toUpperCase() || 'Role not assigned'}
            </Typography>
          </Grid>

          {/* Profile Details Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Profile Details</Typography>
              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  variant="outlined"
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phoneNumber: user?.phoneNumber || '',
                        dateOfBirth: user?.dateOfBirth?.split('T')[0] || '',
                        profilePicture: user?.profilePicture || '',
                        address: {
                          street: user?.address?.street || '',
                          unitNumber: user?.address?.unitNumber || '',
                          province: user?.address?.province || '',
                          country: user?.address?.country || '',
                          zipCode: user?.address?.zipCode || '',
                        }
                      });
                    }}
                    variant="outlined"
                    color="error"
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={true} // Email should not be editable
                  type="email"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Address Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Unit Number"
                  name="address.unitNumber"
                  value={formData.address.unitNumber}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, unitNumber: e.target.value }
                  }))}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Province"
                  name="address.province"
                  value={formData.address.province}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, province: e.target.value }
                  }))}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, country: e.target.value }
                  }))}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default ProfilePage; 
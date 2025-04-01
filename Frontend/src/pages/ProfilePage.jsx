import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  DeleteForever as DeleteIcon,
} from "@mui/icons-material";
import {
  selectUser,
  selectAuthToken,
  updateUserProfile,
  logout,
} from "../store/slices/authSlice";
import logger from "../utils/logger";

const ProfilePage = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectAuthToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    dateOfBirth: user?.dateOfBirth?.split("T")[0] || "",
    profilePicture: user?.profilePicture || "",
    address: {
      street: user?.address?.street || "",
      unitNumber: user?.address?.unitNumber || "",
      province: user?.address?.province || "",
      country: user?.address?.country || "",
      zipCode: user?.address?.zipCode || "",
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      console.log(
        `Image upload attempt: ${file.name} (${file.size} bytes, ${file.type})`
      );

      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "Image is too large! Maximum size is 2MB.",
          severity: "error",
        });
        return;
      }

      // Check file type
      if (!file.type.match("image.*")) {
        setSnackbar({
          open: true,
          message: "Only image files are allowed!",
          severity: "error",
        });
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target.result;

        // Show image immediately for better UX
        setFormData((prev) => ({
          ...prev,
          profilePicture: base64Image,
        }));

        // Update user with new image
        try {
          // Create form data with user details and base64 image
          const userId = user._id;

          // Get token from Redux state or sessionStorage as fallback
          const authToken =
            token ||
            sessionStorage.getItem("token") ||
            localStorage.getItem("token");

          console.log(
            `Sending profile update for user ${userId} with token available: ${!!authToken}`
          );

          if (!authToken) {
            setSnackbar({
              open: true,
              message: "Authentication token not found. Please log in again.",
              severity: "error",
            });
            return;
          }

          const response = await fetch(
            `http://localhost:3000/api/users/${userId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({
                profilePicture: base64Image,
              }),
              credentials: "include",
              mode: "cors",
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(
              "Profile picture update failed:",
              response.status,
              errorData
            );

            if (response.status === 401) {
              setSnackbar({
                open: true,
                message: "Your session has expired. Please log in again.",
                severity: "error",
              });
              // You might want to redirect to login page here
            } else if (response.status === 413) {
              setSnackbar({
                open: true,
                message: "Image is too large! Please try a smaller image.",
                severity: "error",
              });
            } else {
              setSnackbar({
                open: true,
                message:
                  errorData.message || "Failed to update profile picture",
                severity: "error",
              });
            }

            // Revert to old image
            setFormData((prev) => ({
              ...prev,
              profilePicture: user.profilePicture,
            }));
            return;
          }

          const data = await response.json();
          console.log("Profile picture update successful:", data);

          // Update Redux store with new profile picture
          dispatch(updateUserProfile(data.data));

          setSnackbar({
            open: true,
            message: "Profile picture updated successfully!",
            severity: "success",
          });
        } catch (error) {
          console.error("Error updating profile picture:", error);

          setSnackbar({
            open: true,
            message: error.message || "Failed to update profile picture",
            severity: "error",
          });

          // Revert to old image
          setFormData((prev) => ({
            ...prev,
            profilePicture: user.profilePicture,
          }));
        }
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setSnackbar({
          open: true,
          message: "Could not read the image file",
          severity: "error",
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image upload error:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred while uploading the image",
        severity: "error",
      });
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/users/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error("Failed to fetch user data");
      }

      const result = await response.json();
      if (result.code === 200) {
        const userData = result.data;
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          dateOfBirth: userData.dateOfBirth?.split("T")[0] || "",
          profilePicture: userData.profilePicture || "",
          address: {
            street: userData.address?.street || "",
            unitNumber: userData.address?.unitNumber || "",
            province: userData.address?.province || "",
            country: userData.address?.country || "",
            zipCode: userData.address?.zipCode || "",
          },
        });
      }
    } catch (err) {
      setError(err.message);
      logger.error("Fetch user data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Preparing to update profile:", {
        userId: user._id,
        formDataKeys: Object.keys(formData),
        hasProfilePicture: !!formData.profilePicture,
        pictureLength: formData.profilePicture
          ? formData.profilePicture.length
          : 0,
      });

      // Create a new object without the profilePicture if it's too large
      // This prevents 413 Payload Too Large errors
      const submissionData = { ...formData };

      // If the profile picture is a base64 string and very large, it might cause issues
      if (
        submissionData.profilePicture &&
        submissionData.profilePicture.length > 1000000
      ) {
        console.log(
          "Profile picture is large, checking if it needs to be sent again"
        );

        // Only send profile picture if it changed (starts with data:image)
        if (!submissionData.profilePicture.startsWith("data:image")) {
          console.log(
            "Using existing profile picture URL, not sending base64 data"
          );
          delete submissionData.profilePicture;
        } else {
          console.log("Profile picture is a new upload, keeping in submission");
        }
      }

      const response = await fetch(
        `http://localhost:3000/api/users/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),
          // Add these settings to help with CORS
          credentials: "include",
          mode: "cors",
        }
      );

      console.log("Update response status:", response.status);

      if (!response.ok) {
        let errorMessage = `Failed to update profile: ${response.status}`;

        try {
          // Try to get the error details from the response
          const errorData = await response.json();
          console.error("Error details:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
          // Try to get at least the text
          const errorText = await response.text();
          console.error("Error response text:", errorText);
        }

        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        } else if (response.status === 413) {
          throw new Error(
            "Profile data is too large. Please use a smaller profile picture."
          );
        } else {
          throw new Error(errorMessage);
        }
      }

      const result = await response.json();
      if (result.code === 200) {
        dispatch(updateUserProfile(result.data));
        setIsEditing(false);
        setSnackbar({
          open: true,
          message: "Profile updated successfully",
          severity: "success",
        });
      } else {
        throw new Error(
          result.message || "Update failed with an unknown error"
        );
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "An unknown error occurred");
      setSnackbar({
        open: true,
        message: err.message || "Failed to update profile",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:3000/api/users/${user._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      const result = await response.json();
      if (result.code === 200) {
        setSnackbar({
          open: true,
          message: "Account deleted successfully",
          severity: "success",
        });

        // Logout the user after account deletion
        setTimeout(() => {
          dispatch(logout());
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
      logger.error("Account deletion error:", err);
      setSnackbar({
        open: true,
        message: `Failed to delete account: ${err.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
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
          <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={formData.profilePicture}
                alt={formData.name}
                sx={{
                  width: 200,
                  height: 200,
                  mb: 2,
                  border: "4px solid",
                  borderColor: "primary.main",
                }}
              />
              {isEditing && (
                <input
                  accept="image/*"
                  type="file"
                  id="profile-picture-input"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              )}
              {isEditing && (
                <label htmlFor="profile-picture-input">
                  <IconButton
                    component="span"
                    sx={{
                      position: "absolute",
                      bottom: 20,
                      right: 0,
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}>
                    <PhotoCameraIcon />
                  </IconButton>
                </label>
              )}
            </Box>
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user?.role_id?.name?.toUpperCase() || "Role not assigned"}
            </Typography>
          </Grid>

          {/* Profile Details Section */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6">Profile Details</Typography>
              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  variant="outlined">
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}>
                    Save
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                        phoneNumber: user?.phoneNumber || "",
                        dateOfBirth: user?.dateOfBirth?.split("T")[0] || "",
                        profilePicture: user?.profilePicture || "",
                        address: {
                          street: user?.address?.street || "",
                          unitNumber: user?.address?.unitNumber || "",
                          province: user?.address?.province || "",
                          country: user?.address?.country || "",
                          zipCode: user?.address?.zipCode || "",
                        },
                      });
                    }}
                    variant="outlined"
                    color="error">
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value },
                    }))
                  }
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Unit Number"
                  name="address.unitNumber"
                  value={formData.address.unitNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, unitNumber: e.target.value },
                    }))
                  }
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Province"
                  name="address.province"
                  value={formData.address.province}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, province: e.target.value },
                    }))
                  }
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value },
                    }))
                  }
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value },
                    }))
                  }
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

        {/* Add Delete Account Button */}
        <Box sx={{ mt: 5, pt: 3, borderTop: "1px solid #eee" }}>
          <Typography variant="h6" color="error" gutterBottom>
            Danger Zone
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={loading}>
            Delete Account
          </Button>
        </Box>

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
          <DialogTitle>Delete Your Account?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete your account? This action cannot
              be undone and all your data will be permanently removed from our
              servers.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteConfirm} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              color="error"
              variant="contained"
              disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default ProfilePage;

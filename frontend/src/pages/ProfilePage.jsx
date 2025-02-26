import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Skeleton,
  Alert,
  Divider,
  IconButton,
  Modal,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import {
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../store/slices/authSlice";
import logger from "../utils/logger";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const roleMapping = {
    "67bb9c77ee11822f1295c3e7": "Driver",
    "67bb9c6aee11822f1295c3e3": "Customer",
    "67bb9c89ee11822f1295c3eb": "Super Admin",
  };

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:3000/api/users/${currentUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      setUserDetails(data);
      setEditForm({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        dateOfBirth: data.dateOfBirth.split("T")[0],
      });
    } catch (err) {
      setError(err.message);
      logger.error("Error fetching user details", { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      fetchUserDetails();
    }
  }, [currentUser?._id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${currentUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      await fetchUserDetails(); // Refresh user details
      setOpenModal(false);
      logger.info("Profile updated successfully");
    } catch (err) {
      setUpdateError(err.message);
      logger.error("Error updating profile", { error: err.message });
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, position: "relative" }}>
          <Skeleton variant="circular" width={80} height={80} />
          <Skeleton variant="text" width={200} height={40} sx={{ mt: 2 }} />
          <Skeleton variant="text" width={150} height={30} />
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} key={item}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={20} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          position: "relative",
          background: "linear-gradient(145deg, #ffffff 0%, #f4f4f4 100%)",
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ position: "absolute", top: 16, left: 16 }}
        >
          <ArrowBackIcon />
        </IconButton>

        <IconButton
          onClick={() => setOpenModal(true)}
          sx={{ position: "absolute", top: 16, right: 16 }}
        >
          <EditIcon color="primary" />
        </IconButton>

        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "flex-start" },
          mb: 4 
        }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: "primary.main",
              boxShadow: 3,
              mb: { xs: 2, sm: 0 },
              mr: { sm: 3 }
            }}
          >
            <PersonIcon sx={{ fontSize: 50 }} />
          </Avatar>
          
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="h4" gutterBottom>
              {userDetails?.firstName} {userDetails?.lastName}
            </Typography>
            <Typography
              variant="h6"
              color="primary"
              sx={{ fontWeight: "medium" }}
            >
              {roleMapping[userDetails?.role_id] || "User"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, fontWeight: "medium" }}>
              {userDetails?.email}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Date of Birth
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, fontWeight: "medium" }}>
              {userDetails?.dateOfBirth
                ? formatDate(userDetails.dateOfBirth)
                : "Not provided"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Role
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, fontWeight: "medium" }}>
              {roleMapping[userDetails?.role_id] || "Unknown Role"}
            </Typography>
          </Grid>
        </Grid>

        {/* Edit Modal */}
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          aria-labelledby="edit-profile-modal"
        >
          <Box sx={modalStyle}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">Edit Profile</Typography>
              <IconButton onClick={() => setOpenModal(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {updateError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {updateError}
              </Alert>
            )}

            <form onSubmit={handleEditSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  required
                />
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  value={editForm.dateOfBirth}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dateOfBirth: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updateLoading}
                  sx={{ mt: 2 }}
                >
                  {updateLoading ? "Saving..." : "Save Changes"}
                </Button>
              </Stack>
            </form>
          </Box>
        </Modal>
      </Paper>
    </Container>
  );
};

export default ProfilePage; 
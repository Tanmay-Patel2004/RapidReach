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
} from "@mui/material";
import { Person as PersonIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../store/slices/authSlice";
import logger from "../utils/logger";

const ProfilePage = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const roleMapping = {
    "67bb9c77ee11822f1295c3e7": "Driver",
    "67bb9c6aee11822f1295c3e3": "Customer",
    "67bb9c89ee11822f1295c3eb": "Super Admin",
  };

  useEffect(() => {
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
      } catch (err) {
        setError(err.message);
        logger.error("Error fetching user details", { error: err.message });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?._id) {
      fetchUserDetails();
    }
  }, [currentUser?._id]);

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
      </Paper>
    </Container>
  );
};

export default ProfilePage; 
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import logger from "../utils/logger";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  // Extract token from URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get("token");

    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setToastMessage(
        "Reset token is missing. Please request a new password reset."
      );
      setToastSeverity("error");
      setShowToast(true);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.password || formData.password.length < 6) {
      setToastMessage("Password must be at least 6 characters");
      setToastSeverity("error");
      setShowToast(true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToastMessage("Passwords don't match");
      setToastSeverity("error");
      setShowToast(true);
      return;
    }

    if (!token) {
      setToastMessage("Reset token is missing");
      setToastSeverity("error");
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      const response = await api.fetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        setResetComplete(true);
        setToastMessage("Your password has been reset successfully");
        setToastSeverity("success");
        logger.info("Password reset completed successfully");
      } else {
        throw new Error(result.message || "Failed to reset password");
      }
    } catch (error) {
      setToastMessage(error.message || "An error occurred");
      setToastSeverity("error");
      logger.error("Password reset error:", { error: error.message });
    } finally {
      setLoading(false);
      setShowToast(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
        overflow: "hidden",
      }}>
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          position: "relative",
          zIndex: 2,
        }}>
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              borderRadius: 2,
              background: `
                linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)),
                url('https://img.freepik.com/free-vector/white-abstract-background_23-2148806276.jpg')
              `,
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}>
            {/* Logo space */}
            <Box
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                background: "rgba(240, 247, 255, 0.8)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}>
              <Typography
                variant="h4"
                color="primary"
                sx={{ fontWeight: "bold" }}>
                RR
              </Typography>
            </Box>

            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 1,
                color: "#1976d2",
                fontWeight: 600,
                textShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}>
              Rapid Reach
            </Typography>

            <Typography
              component="h2"
              variant="h5"
              sx={{
                mb: 3,
                color: "#555",
                fontWeight: 500,
              }}>
              Reset Password
            </Typography>

            {!resetComplete ? (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ mt: 1, width: "100%" }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 2, color: "text.secondary" }}>
                  Enter your new password below.
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="New Password"
                  type="password"
                  autoFocus
                  value={formData.password}
                  onChange={handleChange}
                  inputProps={{ minLength: 6 }}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: 1,
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  inputProps={{ minLength: 6 }}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: 1,
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    backgroundColor: "#1976d2",
                    backgroundImage:
                      "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                    "&:hover": {
                      backgroundImage:
                        "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                    },
                  }}
                  disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Reset Password"}
                </Button>
              </Box>
            ) : (
              <Box sx={{ mt: 1, width: "100%", textAlign: "center" }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Your password has been reset successfully!
                </Alert>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  You can now log in with your new password.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate("/")}
                  sx={{
                    py: 1.5,
                    backgroundColor: "#1976d2",
                    backgroundImage:
                      "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  }}>
                  Return to Login
                </Button>
              </Box>
            )}
          </Paper>
        </Box>

        <Snackbar
          open={showToast}
          autoHideDuration={6000}
          onClose={() => setShowToast(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            onClose={() => setShowToast(false)}
            severity={toastSeverity}
            sx={{ width: "100%" }}>
            {toastMessage}
          </Alert>
        </Snackbar>
      </Container>

      {/* Background decorative elements */}
      <Box
        sx={{
          position: "absolute",
          right: "15%",
          top: "20%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: "25%",
          bottom: "15%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          zIndex: 1,
        }}
      />
    </Box>
  );
};

export default ResetPasswordPage;

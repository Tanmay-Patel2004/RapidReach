import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import logger from "../utils/logger";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");
  const [resetRequested, setResetRequested] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!email) {
      setToastMessage("Please enter your email address");
      setToastSeverity("error");
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      const response = await api.fetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.code === 200) {
        setResetRequested(true);
        // Store token for development purposes only
        // In production, this would be sent via email
        setResetToken(result.data.resetToken);

        setToastMessage("Password reset instructions sent to your email");
        setToastSeverity("success");
        logger.info("Password reset requested for:", email);
      } else {
        throw new Error(result.message || "Failed to process request");
      }
    } catch (error) {
      setToastMessage(error.message || "An error occurred");
      setToastSeverity("error");
      logger.error("Forgot password error:", { error: error.message });
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
              Forgot Password
            </Typography>

            {!resetRequested ? (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ mt: 1, width: "100%" }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 2, color: "text.secondary" }}>
                  Enter your email address and we'll send you a link to reset
                  your password.
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={handleChange}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
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
                  {loading ? <CircularProgress size={24} /> : "Send Reset Link"}
                </Button>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    mt: 2,
                    borderTop: "1px solid rgba(0,0,0,0.1)",
                    pt: 2,
                  }}>
                  <RouterLink
                    to="/"
                    style={{
                      textDecoration: "none",
                      color: "#555",
                    }}>
                    Back to Login
                  </RouterLink>
                </Box>
              </Box>
            ) : (
              <Box sx={{ mt: 1, width: "100%", textAlign: "center" }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Check your email for password reset instructions.
                </Typography>

                {/* For development/demo purposes only - in production this would be sent via email */}
                {resetToken && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "rgba(25, 118, 210, 0.1)",
                      borderRadius: 1,
                    }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: "primary.main" }}>
                      Development Mode: Use the token below to reset your
                      password
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, wordBreak: "break-all" }}>
                      {resetToken}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        navigate(`/reset-password?token=${resetToken}`)
                      }
                      sx={{ mt: 1 }}>
                      Reset Password
                    </Button>
                  </Box>
                )}

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={() => navigate("/")}>
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

export default ForgotPasswordPage;

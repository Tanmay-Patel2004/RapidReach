import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Paper,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import GoogleIcon from "@mui/icons-material/Google";
import { Link as RouterLink } from "react-router-dom";

// Add BASE_URL constant
const BASE_URL = "http://localhost:3000/api";
const GOOGLE_CLIENT_ID =
  "886926687082-h2nkmtu9p2svl6eu2kl2jsvp2ck7i90j.apps.googleusercontent.com"; // Your Google Client ID

const SignUpPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    phoneNumber: "",
    address: {
      street: "",
      unitNumber: "",
      province: "",
      country: "",
      zipCode: "",
    },
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGoogleScript = () => {
      // Remove any existing Google Sign-In scripts
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = () => {
        console.error("Failed to load Google Sign-In script");
        setError(
          "Failed to initialize Google Sign-In. Please try again later."
        );
      };
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      try {
        if (!window.google) {
          console.error("Google API not loaded");
          return;
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: "signin",
          ux_mode: "popup",
        });

        const buttonElement = document.getElementById("googleSignInButton");
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "center",
            width: buttonElement.offsetWidth,
          });
        } else {
          console.error("Google Sign-In button element not found");
        }
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
        setError(
          "Failed to initialize Google Sign-In. Please try again later."
        );
      }
    };

    loadGoogleScript();

    return () => {
      // Cleanup
      const script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (script) {
        document.body.removeChild(script);
      }
      // Cancel any ongoing Google Sign-In
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      console.log("Google response received:", response);
      setLoading(true);
      setError("");

      if (!response.credential) {
        throw new Error("No credential received from Google");
      }

      const googleToken = response.credential;

      console.log("Sending Google token to backend");
      const backendResponse = await fetch(`${BASE_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: googleToken }),
      });

      const data = await backendResponse.json();
      console.log("Backend response:", data);

      if (backendResponse.ok) {
        // Store user data in the exact format expected by Navbar
        const userData = {
          id: data.data._id,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          email: data.data.email,
          role_id: data.data.role_id,
        };

        // Store token and user data
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Force a full page reload and redirect to dashboard
        window.location.replace("/customer/dashboard");
      } else {
        throw new Error(data.message || "Google sign-in failed");
      }
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      setError(
        error.message || "Failed to sign in with Google. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      // Handle nested address fields
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRoleChange = (e) => {
    const roleMapping = {
      driver: "67bb9c77ee11822f1295c3e7",
      customer: "67bb9c6aee11822f1295c3e3",
    };
    const newRoleId = roleMapping[e.target.value];
    console.log("Selected Role:", e.target.value, "RoleId:", newRoleId);
    setFormData({
      ...formData,
      role_id: newRoleId,
    });
  };

  const handleCloseSuccessDialog = () => {
    setOpenSuccessDialog(false);
    navigate("/customer/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Create the exact payload that matches your backend expectations
    const requestPayload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      dateOfBirth: formData.dateOfBirth,
      role_id: "67bb9c6aee11822f1295c3e3", // Default customer role ID
      phoneNumber: formData.phoneNumber || null,
      address: {
        street: formData.address.street || null,
        unitNumber: formData.address.unitNumber || null,
        province: formData.address.province || null,
        country: formData.address.country || null,
        zipCode: formData.address.zipCode || null,
      },
    };

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "password",
      "dateOfBirth",
    ];
    const emptyFields = requiredFields.filter(
      (field) => !requestPayload[field]
    );

    if (emptyFields.length > 0) {
      setError(`Please fill in all required fields: ${emptyFields.join(", ")}`);
      setLoading(false);
      return;
    }

    // Basic validations
    if (requestPayload.firstName.length < 2) {
      setError("First name must be at least 2 characters long");
      setLoading(false);
      return;
    }

    if (requestPayload.lastName.length < 2) {
      setError("Last name must be at least 2 characters long");
      setLoading(false);
      return;
    }

    if (requestPayload.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestPayload.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      console.log(
        "Sending registration request to:",
        `${BASE_URL}/auth/register`
      );
      console.log("Request payload:", {
        ...requestPayload,
        password: "[HIDDEN]",
      });

      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (response.ok) {
        // Store user data and token
        localStorage.setItem("token", data.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.data._id,
            name: data.data.name,
            email: data.data.email,
            role_id: data.data.role_id,
          })
        );

        // Show success dialog instead of immediate navigation
        setOpenSuccessDialog(true);
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
        overflow: "auto",
        py: 4,
        "&::before": {
          content: '""',
          position: "absolute",
          right: 0,
          top: 0,
          width: "70%",
          height: "100%",
          background: `
            linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%),
            repeating-linear-gradient(
              45deg,
              rgba(255,255,255,0.05) 0px,
              rgba(255,255,255,0.05) 2px,
              transparent 2px,
              transparent 8px
            )
          `,
          backdropFilter: "blur(2px)",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          right: "20%",
          top: 0,
          width: "1px",
          height: "100%",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)",
          zIndex: 1,
        },
      }}>
      <Container
        component="main"
        maxWidth="sm"
        sx={{ position: "relative", zIndex: 2 }}>
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
              linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
          {/* Logo */}
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

          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Sign Up
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="firstName"
                  required
                  fullWidth
                  label="First Name"
                  autoFocus
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="phoneNumber"
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </Grid>

              {/* Address Fields */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Address (Optional)
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address.street"
                  label="Street Address"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="address.unitNumber"
                  label="Unit Number"
                  value={formData.address.unitNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="address.province"
                  label="Province/State"
                  value={formData.address.province}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="address.country"
                  label="Country"
                  value={formData.address.country}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="address.zipCode"
                  label="Postal/ZIP Code"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              loading={loading}
              sx={{ mt: 3, mb: 2 }}>
              Sign Up
            </LoadingButton>

            <div
              id="googleSignInButton"
              style={{ width: "100%", marginBottom: "24px" }}
            />

            <Divider sx={{ width: "100%", mb: 3 }}>
              <Typography color="textSecondary">OR</Typography>
            </Divider>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>

      {/* Success Dialog */}
      <Dialog
        open={openSuccessDialog}
        onClose={handleCloseSuccessDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">
          {"Registration Successful! 🎉"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Your account has been created successfully. Click OK to proceed to
            your dashboard.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseSuccessDialog}
            variant="contained"
            autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Decorative circles */}
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

      {/* Floating shapes */}
      <Box
        sx={{
          position: "absolute",
          right: "30%",
          top: "40%",
          width: "60px",
          height: "60px",
          transform: "rotate(45deg)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "4px",
          zIndex: 1,
          animation: "float 6s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": {
              transform: "rotate(45deg) translate(0, 0)",
            },
            "50%": {
              transform: "rotate(45deg) translate(0, -20px)",
            },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: "60%",
          bottom: "20%",
          width: "40px",
          height: "40px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "50%",
          zIndex: 1,
          animation: "float2 8s ease-in-out infinite",
          "@keyframes float2": {
            "0%, 100%": {
              transform: "translate(0, 0)",
            },
            "50%": {
              transform: "translate(0, -30px)",
            },
          },
        }}
      />

      {/* Text overlay */}
      <Typography
        sx={{
          position: "absolute",
          right: "10%",
          top: "50%",
          transform: "translateY(-50%)",
          color: "rgba(255,255,255,0.1)",
          fontSize: "120px",
          fontWeight: "bold",
          letterSpacing: "4px",
          zIndex: 1,
          display: { xs: "none", md: "block" },
        }}>
        RR
      </Typography>
    </Box>
  );
};

export default SignUpPage;

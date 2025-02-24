import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { loginWithEmailPassword } from "../services/authService";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../features/auth/authSlice";

const PageContainer = styled(Box)({
  height: "100vh", // Ensures full viewport height
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(45deg, #1976d2 30%, #0d47a1 90%)",
});

const LoginContainer = styled(Container)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center", // Ensures centering
  height: "100%", // Ensures the container takes full height
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center", // Centers content inside Paper
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
}));

const Form = styled("form")(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(2),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
}));

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    const { user, error } = await loginWithEmailPassword(
      formData.email,
      formData.password
    );

    if (error) {
      dispatch(loginFailure(error));
      return;
    }

    dispatch(loginSuccess(user));
    navigate("/");
  };

  const handleReset = () => {
    setFormData({
      email: "",
      password: "",
    });
  };

  return (
    <PageContainer>
      <LoginContainer maxWidth="xs">
        <StyledPaper elevation={6}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 1,
              fontWeight: 700,
              color: "primary.main",
              textAlign: "center",
            }}>
            RapidReach
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 3,
              color: "text.secondary",
              fontWeight: 500,
              textAlign: "center",
            }}>
            Welcome Back
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                width: "100%",
                borderRadius: 2,
              }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 1 }}
            />

            <Link
              href="#"
              variant="body2"
              sx={{
                display: "block",
                textAlign: "right",
                color: "primary.main",
                mb: 3,
                "&:hover": {
                  textDecoration: "none",
                  color: "primary.dark",
                },
              }}>
              Forgot password?
            </Link>

            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </SubmitButton>

            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={handleReset}
              sx={{ mt: 1 }}>
              Reset
            </Button>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link
                component={RouterLink}
                to="/signup"
                variant="body2"
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    textDecoration: "none",
                    color: "primary.dark",
                  },
                }}>
                Don't have an account? Sign up
              </Link>
            </Box>
          </Form>
        </StyledPaper>
      </LoginContainer>
    </PageContainer>
  );
};

export default Login;

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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { parse, isDate } from "date-fns";
import { API_BASE_URL } from "../config/api";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  dateOfBirth: Yup.date().required("Date of birth is required"),
  userType: Yup.string().required(
    "Please select whether you are a driver or customer"
  ),
});

const PageContainer = styled(Box)({
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(45deg, #1976d2 30%, #0d47a1 90%)",
});

const SignupContainer = styled(Container)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: "500px",
  backgroundColor: "white",
  borderRadius: "10px",
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  '& .MuiFormLabel-root': {
    marginBottom: theme.spacing(1)
  }
}));

const RedButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ff0000', // Bright red
  '&:hover': {
    backgroundColor: '#cc0000', // Darker red on hover
  },
  '&:disabled': {
    backgroundColor: '#ffcccc', // Light red when disabled
  }
}));

const Signup = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    userType: "", // 'driver' or 'customer'
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      setLoading(true);

      // Get role ID based on user type
      const roleType = values.userType === "driver" ? "driver" : "customer";
      const roleResponse = await fetch(
        `${API_BASE_URL}/api/roles/by-name/${roleType}`
      );
      const roleData = await roleResponse.json();

      if (!roleResponse.ok) {
        throw new Error("Failed to get role information");
      }

      const registrationData = {
        ...values,
        role_id: roleData._id, // Add role_id to registration data
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Registration successful
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <SignupContainer maxWidth="sm">
        <StyledPaper>
          <Typography variant="h5" component="h1" gutterBottom>
            Sign Up
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form style={{ width: '100%' }}>
                <TextField
                  fullWidth
                  name="firstName"
                  label="First Name"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstName && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  name="lastName"
                  label="Last Name"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={values.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
                  helperText={touched.dateOfBirth && errors.dateOfBirth}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  margin="normal"
                />

                <StyledFormControl error={touched.userType && Boolean(errors.userType)}>
                  <FormLabel>I am a:</FormLabel>
                  <RadioGroup
                    name="userType"
                    value={values.userType}
                    onChange={handleChange}
                    sx={{ marginTop: 1 }}
                  >
                    <FormControlLabel
                      value="driver"
                      control={<Radio />}
                      label="Driver"
                      sx={{ marginBottom: 1 }}
                    />
                    <FormControlLabel
                      value="customer"
                      control={<Radio />}
                      label="Customer"
                    />
                  </RadioGroup>
                  {touched.userType && errors.userType && (
                    <Typography color="error" variant="caption">
                      {errors.userType}
                    </Typography>
                  )}
                </StyledFormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    bgcolor: '#ff0000', // Bright red
                    '&:hover': {
                      bgcolor: '#cc0000', // Darker red on hover
                    },
                    '&:disabled': {
                      bgcolor: '#ffcccc', // Light red when disabled
                    }
                  }}>
                  {loading ? <CircularProgress size={24} /> : "Sign Up"}
                </Button>

                <Box textAlign="center">
                  <Link component={RouterLink} to="/login" variant="body2">
                    Already have an account? Sign in
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        </StyledPaper>
      </SignupContainer>
    </PageContainer>
  );
};

export default Signup;

import React from "react";
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
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { parse, isDate } from 'date-fns';
import { register } from "../services/authService";
import { loginStart, loginSuccess, loginFailure } from "../features/auth/authSlice";

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
  width: "100%",
  maxWidth: 500,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
}));

const StyledForm = styled(Form)({
  width: "100%",
});

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
}));

// Validation schema
const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .matches(/^[a-zA-Z]+$/, 'First name must contain only letters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .matches(/^[a-zA-Z]+$/, 'Last name must contain only letters'),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .test('age', 'Must be at least 18 years old', function(value) {
      if (!value) return false;
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 18);
      return value <= cutoff;
    })
    .transform((value, originalValue) => {
      const parsedDate = isDate(originalValue) 
        ? originalValue 
        : parse(originalValue, 'yyyy-MM-dd', new Date());
      return parsedDate;
    }),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (values, { setSubmitting }) => {
    dispatch(loginStart());

    const { user, error } = await register({
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth,
      email: values.email,
      password: values.password,
    });

    if (error) {
      dispatch(loginFailure(error));
      return;
    }

    dispatch(loginSuccess(user));
    navigate("/");
  };

  return (
    <PageContainer>
      <SignupContainer maxWidth="sm">
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
            Create Your Account
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

          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, handleChange, handleBlur, values }) => (
              <StyledForm>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    name="firstName"
                    label="First Name"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
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
                  />
                </Box>

                <TextField
                  fullWidth
                  type="date"
                  name="dateOfBirth"
                  label="Date of Birth"
                  InputLabelProps={{ shrink: true }}
                  value={values.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
                  helperText={touched.dateOfBirth && errors.dateOfBirth}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  sx={{ mb: 2 }}
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
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  sx={{ mb: 2 }}
                />

                <SubmitButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}>
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Sign Up"
                  )}
                </SubmitButton>

                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    sx={{
                      color: "primary.main",
                      "&:hover": {
                        textDecoration: "none",
                        color: "primary.dark",
                      },
                    }}>
                    Already have an account? Sign in
                  </Link>
                </Box>
              </StyledForm>
            )}
          </Formik>
        </StyledPaper>
      </SignupContainer>
    </PageContainer>
  );
};

export default Signup; 
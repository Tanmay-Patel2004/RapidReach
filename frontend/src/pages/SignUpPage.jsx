import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from '@mui/material';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    role_id: '67bb9c6aee11822f1295c3e3', // Changed from roleId to role_id
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    const roleMapping = {
      'driver': '67bb9c77ee11822f1295c3e7',
      'customer': '67bb9c6aee11822f1295c3e3'
    };
    const newRoleId = roleMapping[e.target.value];
    console.log('Selected Role:', e.target.value, 'RoleId:', newRoleId);
    setFormData({
      ...formData,
      role_id: newRoleId // Changed from roleId to role_id
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Trim all string values to remove extra spaces
    const requestPayload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      dateOfBirth: formData.dateOfBirth,
      role_id: formData.role_id, // Changed from roleId to role_id
    };

    // Validate field lengths
    if (requestPayload.firstName.length < 2) {
      setError('First name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    if (requestPayload.lastName.length < 2) {
      setError('Last name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    if (requestPayload.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate all required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'dateOfBirth', 'role_id']; // Changed from roleId to role_id
    const emptyFields = requiredFields.filter(field => !requestPayload[field]);
    
    if (emptyFields.length > 0) {
      setError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      setLoading(false);
      return;
    }

    // Add validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestPayload.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Validate date of birth
    const dobDate = new Date(requestPayload.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    if (age < 18) {
      setError('You must be at least 18 years old to register');
      setLoading(false);
      return;
    }

    // Log the final payload for debugging
    console.log('Final Request Payload:', {
      ...requestPayload,
      password: '***hidden***' // Hide password in logs
    });

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload),
        credentials: 'include'
      });

      const responseText = await response.text();
      console.log('Raw Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed Response Data:', data);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error(`Server response is not valid JSON: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Registration failed with status ${response.status}`);
      }

      // Registration successful
      console.log('Registration successful:', data);
      navigate('/');
    } catch (err) {
      console.error('Registration Error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          right: 0,
          top: 0,
          width: '70%',
          height: '100%',
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
          backdropFilter: 'blur(2px)',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          right: '20%',
          top: 0,
          width: '1px',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
          zIndex: 1,
        },
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              borderRadius: 2,
              background: `
                linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)),
                url('https://img.freepik.com/free-vector/white-abstract-background_23-2148806276.jpg')
              `,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Logo space */}
            <Box
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                background: 'rgba(240, 247, 255, 0.8)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                RR
              </Typography>
            </Box>

            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 1,
                color: '#1976d2',
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              Rapid Reach
            </Typography>

            <Typography
              component="h2"
              variant="h5"
              sx={{
                mb: 3,
                color: '#555',
                fontWeight: 500,
              }}
            >
              Sign Up
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                value={formData.firstName}
                onChange={handleChange}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                type="date"
                id="dateOfBirth"
                label="Date of Birth"
                name="dateOfBirth"
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={handleChange}
                inputProps={{
                  max: new Date().toISOString().split('T')[0]  // Today's date
                }}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
                <FormLabel component="legend">Select Role</FormLabel>
                <RadioGroup
                  row
                  name="role"
                  value={formData.role_id === '67bb9c77ee11822f1295c3e7' ? 'driver' : 'customer'} // Changed from roleId to role_id
                  onChange={handleRoleChange}
                  sx={{
                    justifyContent: 'space-around',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 1,
                    padding: 2,
                  }}
                >
                  <FormControlLabel 
                    value="customer" 
                    control={<Radio />} 
                    label="Customer"
                  />
                  <FormControlLabel 
                    value="driver" 
                    control={<Radio />} 
                    label="Driver"
                  />
                </RadioGroup>
              </FormControl>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  backgroundColor: '#1976d2',
                  backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
              </Button>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  mt: 2,
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                  pt: 2,
                }}
              >
                <Link
                  to="/"
                  style={{
                    textDecoration: 'none',
                    color: '#555',
                  }}
                >
                  Already have an account? Login
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          right: '15%',
          top: '20%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: '25%',
          bottom: '15%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 1,
        }}
      />

      {/* Floating shapes */}
      <Box
        sx={{
          position: 'absolute',
          right: '30%',
          top: '40%',
          width: '60px',
          height: '60px',
          transform: 'rotate(45deg)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          zIndex: 1,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': {
              transform: 'rotate(45deg) translate(0, 0)',
            },
            '50%': {
              transform: 'rotate(45deg) translate(0, -20px)',
            },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: '60%',
          bottom: '20%',
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%',
          zIndex: 1,
          animation: 'float2 8s ease-in-out infinite',
          '@keyframes float2': {
            '0%, 100%': {
              transform: 'translate(0, 0)',
            },
            '50%': {
              transform: 'translate(0, -30px)',
            },
          },
        }}
      />

      {/* Text overlay */}
      <Typography
        sx={{
          position: 'absolute',
          right: '10%',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.1)',
          fontSize: '120px',
          fontWeight: 'bold',
          letterSpacing: '4px',
          zIndex: 1,
          display: { xs: 'none', md: 'block' },
        }}
      >
        RR
      </Typography>
    </Box>
  );
};

export default SignUpPage; 
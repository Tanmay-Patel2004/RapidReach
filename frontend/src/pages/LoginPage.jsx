import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Alert
} from '@mui/material';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import logger from '../utils/logger';

const LoginPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(loginSuccess(data));
        
        setToastMessage(`Welcome back, ${data.firstName}!`);
        setToastSeverity('success');
        setShowToast(true);
        
        logger.info('Login successful', { 
          userId: data._id,
          email: data.email,
          role: data.role.name,
          permissionsCount: data.permissions.length 
        });
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      dispatch(loginFailure(error.message));
      setToastMessage(error.message || 'Login failed');
      setToastSeverity('error');
      setShowToast(true);
      logger.error('Login failed', { error: error.message });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
        overflow: 'hidden', // Prevent pattern overflow
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
        }
      }}
    >
      <Container 
        component="main" 
        maxWidth="xs"
        sx={{
          position: 'relative',
          zIndex: 2, // Ensure form appears above background patterns
        }}
      >
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
              Sign In
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
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
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
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
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>

              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  width: '100%', 
                  mt: 2,
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                  pt: 2,
                }}
              >
                <Link 
                  href="#" 
                  variant="body2"
                  sx={{
                    color: '#555',
                    '&:hover': {
                      color: '#1976d2',
                    },
                  }}
                >
                  Forgot password?
                </Link>
                <Link 
                  href="#" 
                  variant="body2"
                  sx={{
                    color: '#555',
                    '&:hover': {
                      color: '#1976d2',
                    },
                  }}
                >
                  {"Don't have an account? Sign Up"}
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Snackbar
          open={showToast}
          autoHideDuration={6000}
          onClose={() => setShowToast(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setShowToast(false)}
            severity={toastSeverity}
            sx={{ width: '100%' }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      </Container>

      {/* Add decorative circles */}
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

      {/* Add floating shapes */}
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

      {/* Optional: Add a subtle text overlay */}
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
          display: { xs: 'none', md: 'block' }, // Hide on mobile
        }}
      >
        RR
      </Typography>
    </Box>
  );
};

export default LoginPage; 
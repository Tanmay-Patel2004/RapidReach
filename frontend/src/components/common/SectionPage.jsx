import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Breadcrumbs,
  Link,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  People,
  Security,
  AdminPanelSettings,
  Warehouse,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice'; // Adjust the path based on your store structure

const SectionPage = () => {
  const token = useSelector(selectToken);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // Configuration object for section details
  const sectionConfig = {
    '/users': {
      title: 'User Management',
      icon: <People sx={{ fontSize: 40, color: '#1976d2' }} />,
      description: 'Manage system users and their access',
    },
    '/roles': {
      title: 'Role Management',
      icon: <AdminPanelSettings sx={{ fontSize: 40, color: '#1976d2' }} />,
      description: 'Configure user roles and their capabilities',
    },
    '/permissions': {
      title: 'Permission Management',
      icon: <Security sx={{ fontSize: 40, color: '#1976d2' }} />,
      description: 'Define and manage system permissions',
    },
    '/permission-relations': {
      title: 'Permission Relations',
      icon: <Security sx={{ fontSize: 40, color: '#1976d2' }} />,
      description: 'Manage relationships between permissions',
    },
    '/warehouse': {
      title: 'Warehouse Management',
      icon: <Warehouse sx={{ fontSize: 40, color: '#1976d2' }} />,
      description: 'Manage warehouse operations and inventory',
    },
  };

  const currentSection = sectionConfig[location.pathname] || {
    title: '404 - Not Found',
    icon: null,
    description: 'The requested section does not exist',
  };

  // Function to generate breadcrumb text
  const getBreadcrumbText = (path) => {
    return path.charAt(1).toUpperCase() + path.slice(2).replace(/-/g, ' ');
  };

  // Get placeholder text based on current section
  const getSearchPlaceholder = () => {
    const section = location.pathname.slice(1);
    return `Search ${section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ')}...`;
  };

  // Column definitions for different sections
  const columnDefinitions = {
    '/users': [
      { field: 'Full Name', headerName: 'name', width: 150 },
      { field: 'Email Address', headerName: 'email', width: 200 },
      { field: 'Contact Number', headerName: 'phoneNumber', width: 130 },
      { field: 'Role', headerName: 'role', width: 130 },
      { field: 'User Type', headerName: 'user_type', width: 130 },
    ],
    '/permissions': [
      { field: 'id', headerName: 'ID', width: 90 },
      { field: 'name', headerName: 'Permission Name', width: 200 },
      { field: 'description', headerName: 'Description', width: 300 },
      { field: 'module', headerName: 'Module', width: 150 },
    ],
    '/roles': [
      { field: 'id', headerName: 'ID', width: 90 },
      { field: 'name', headerName: 'Role Name', width: 200 },
      { field: 'description', headerName: 'Description', width: 300 },
      { field: 'usersCount', headerName: 'Users', width: 130 },
    ],
    '/permission-relations': [
      { field: 'id', headerName: 'ID', width: 90 },
      { field: 'roleName', headerName: 'Role', width: 200 },
      { field: 'permissionName', headerName: 'Permission', width: 200 },
    ],
    '/warehouse': [
      { field: 'id', headerName: 'ID', width: 90 },
      { field: 'name', headerName: 'Warehouse Name', width: 200 },
      { field: 'location', headerName: 'Location', width: 200 },
      { field: 'capacity', headerName: 'Capacity', width: 130 },
      { field: 'status', headerName: 'Status', width: 130 },
    ],
  };

  // API endpoint mapping
  const apiEndpoints = {
    '/users': 'http://localhost:3000/api/users',
    '/permissions': 'http://localhost:3000/api/permissions',
    '/roles': 'http://localhost:3000/api/roles',
    '/permission-relations': 'http://localhost:3000/api/role-permissions',
    '/warehouse': 'http://localhost:3000/api/warehouses',
  };

  // Create axios instance with default config
  const axiosInstance = axios.create({
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Add axios response interceptor to handle common errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // Handle unauthorized - maybe redirect to login
            setError('Session expired. Please login again.');
            // You might want to dispatch a logout action here
            break;
          case 403:
            setError('You do not have permission to access this resource.');
            break;
          case 404:
            setError('Resource not found.');
            break;
          default:
            setError(error.response.data.message || 'An error occurred while fetching data.');
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
      return Promise.reject(error);
    }
  );

  // Update the fetchData function
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = apiEndpoints[location.pathname];
        if (!endpoint) {
          throw new Error('Invalid endpoint');
        }

        // Use the configured axios instance
        const response = await axiosInstance.get(endpoint);
        
        // Assuming the API returns data in { success: boolean, data: array } format
        if (response.data.success) {
          setData(response.data.data || []);
        } else {
          throw new Error(response.data.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        // Error is now handled by the interceptor
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setError('Authentication token not found');
    }
  }, [location.pathname, token]);

  // Add error display component
  const ErrorDisplay = ({ message }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" color="error" gutterBottom>
        Error
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
      {message.includes('login') && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Go to Login
        </Button>
      )}
    </Box>
  );

  // Render content based on loading/error state
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <ErrorDisplay message={error} />;
    }

    if (!data.length) {
      return (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
      );
    }

    return (
      <DataGrid
        rows={data}
        columns={columnDefinitions[location.pathname] || []}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection
        disableSelectionOnClick
        autoHeight
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            borderBottom: 'none',
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: '#fff',
          },
        }}
      />
    );
  };

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '100%', // Ensure no overflow
      overflowX: 'hidden', // Prevent horizontal scroll
    }}>
      {/* Breadcrumbs Section */}
      <Box sx={{ 
        px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        py: 2, 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e0e0e0',
        width: '100%',
      }}>
        <Breadcrumbs>
          <Link 
            color="inherit" 
            href="/dashboard"
            sx={{ 
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Dashboard
          </Link>
          <Typography color="text.primary">
            {getBreadcrumbText(location.pathname)}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header Section */}
      <Box sx={{ 
        px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        py: 3, 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e0e0e0',
        width: '100%',
      }}>
        <Paper 
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
            borderRadius: 2,
            width: '100%',
          }}
        >
          {/* Title Section */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 3,
          }}>
            {/* Icon */}
            <Box 
              sx={{
                p: 2,
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentSection.icon}
            </Box>

            {/* Title and Description */}
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{
                  fontWeight: 600,
                  color: '#1a3b61',
                  mb: 1,
                }}
              >
                {currentSection.title}
              </Typography>
              <Typography 
                variant="subtitle1"
                sx={{ color: '#5c7184' }}
              >
                {currentSection.description}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Actions Row */}
      <Box sx={{ 
        px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        py: 2,
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        width: '100%',
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          width: '100%',
        }}>
          {/* Add New Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
              height: '48px',
              px: 3,
            }}
          >
            Add New {getBreadcrumbText(location.pathname).slice(0, -1)}
          </Button>

          {/* Search Bar */}
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            flex: { xs: '1', md: '0 1 500px' }, // Increased max width
            width: '100%',
          }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={getSearchPlaceholder()}
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }
              }}
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                minWidth: '100px',
              }}
            >
              Search
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        width: '100%',
      }}>
        <Paper 
          sx={{ 
            width: '100%',
            p: { xs: 2, sm: 3 },
            minHeight: 'calc(100vh - 350px)',
          }}
        >
          {renderContent()}
        </Paper>
      </Box>
    </Box>
  );
};

export default SectionPage; 
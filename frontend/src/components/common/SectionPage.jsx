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
import { selectToken, selectUserPermissions } from '../../store/slices/authSlice';
import logger from '../../utils/logger';

const SectionPage = () => {
  const token = useSelector(selectToken);
  const userPermissions = useSelector(selectUserPermissions);
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
      { 
        field: 'id', 
        headerName: 'ID', 
        width: 150,
        valueGetter: (params) => params ? `USER-${params.slice(-6).toUpperCase()}` : 'N/A'
      },
      { field: 'name', headerName: 'Name', width: 150 },
      { field: 'email', headerName: 'Email', width: 200 },
      { field: 'phoneNumber', headerName: 'Phone', width: 130 },
      { 
        field: 'role_id', 
        headerName: 'Role', 
        width: 130,
        valueGetter: (params) => (params?.name ? params.name.charAt(0).toUpperCase() + params.name.slice(1) : 'N/A')
      },
      { 
        field: 'isEmailVerified', 
        headerName: 'Verified', 
        width: 100,
        valueGetter: (params) => params?.row?.isEmailVerified ? 'Yes' : 'No'
      },
    ],
    '/permissions': [
      { 
        field: 'id', 
        headerName: 'ID', 
        width: 150,
        valueGetter: (params) => params ? `PERM-${params.slice(-6).toUpperCase()}` : 'N/A'
      },
      { field: 'name', headerName: 'Permission Name', width: 200 },
      { field: 'description', headerName: 'Description', width: 300 },
      { field: 'sectionName', headerName: 'Module', width: 150 }
    ],
    '/roles': [
      { 
        field: 'id', 
        headerName: 'ID', 
        width: 150,
        valueGetter: (params) => params ? `ROLE-${params.slice(-6).toUpperCase()}` : 'N/A'
      },
      { 
        field: 'name', 
        headerName: 'Role Name', 
        width: 200,
        valueGetter: (params) => params?.name ? params.name.charAt(0).toUpperCase() + params.name.slice(1) : 'N/A'
      },
      { field: 'description', headerName: 'Description', width: 300 },
      // { field: 'usersCount', headerName: 'Users', width: 130 }
    ],
    '/permission-relations': [
      { 
        field: 'id', 
        headerName: 'ID', 
        width: 150,
        valueGetter: (params) => params ? `REL-${params.slice(-6).toUpperCase()}` : 'N/A'
      },
      { 
        field: 'roleId', 
        headerName: 'Role', 
        width: 200,
        valueGetter: (params) => params?.name || 'N/A'
      },
      { 
        field: 'permissionId', 
        headerName: 'Permission', 
        width: 200,
        valueGetter: (params) => params?.name || 'N/A'
      }
    ],
    '/warehouse': [
      { 
        field: 'id', 
        headerName: 'ID', 
        width: 150,
        valueGetter: (params) => params ? `WH-${params.slice(-6).toUpperCase()}` : 'N/A'
      },
      { field: 'warehouseCode', headerName: 'Warehouse Code', width: 200 },
      { 
        field: 'address', 
        headerName: 'Location', 
        width: 200,
        valueGetter: (params) => params?.zipCode || 'Open'
      },
      { 
        field: 'status', 
        headerName: 'Status', 
        width: 130,
        valueGetter: (params) => params?.status || 'Open'
      }
    ],
  };

  // Create axios instance with default config
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor to add token to all requests
  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle common errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            logger.error('Unauthorized access');
            setError('Session expired. Please login again.');
            navigate('/');
            break;
          case 403:
            logger.error('Forbidden access');
            setError('You do not have permission to access this resource.');
            break;
          case 404:
            logger.error('Resource not found');
            setError('Resource not found.');
            break;
          default:
            logger.error('API Error:', error.response.data);
            setError(error.response.data.message || 'An error occurred while fetching data.');
        }
      } else if (error.request) {
        logger.error('Network error');
        setError('Network error. Please check your connection.');
      } else {
        logger.error('Unexpected error:', error);
        setError('An unexpected error occurred.');
      }
      return Promise.reject(error);
    }
  );

  // API endpoint mapping with permission checks
  const apiEndpoints = {
    '/users': {
      url: '/users',
      requiredPermissionId: 1  // Replace with actual permission ID for viewing users
    },
    '/permissions': {
      url: '/permissions',
      requiredPermissionId: 2  // Replace with actual permission ID for viewing permissions
    },
    '/roles': {
      url: '/roles',
      requiredPermissionId: 3  // Replace with actual permission ID for viewing roles
    },
    '/permission-relations': {
      url: '/role-permissions',
      requiredPermissionId: 4  // Replace with actual permission ID for viewing role permissions
    },
    '/warehouse': {
      url: '/warehouses',
      requiredPermissionId: 5  // Replace with actual permission ID for viewing warehouses
    },
  };

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

        // Check if user has required permission
        const hasPermission = userPermissions.some(
          permission => Number(permission.permission_id) === Number(endpoint.requiredPermissionId)
        );

        if (!hasPermission) {
          logger.warn('Permission denied:', {
            requiredPermissionId: endpoint.requiredPermissionId,
            userPermissions: userPermissions.map(p => p.permission_id)
          });
          setError('You do not have permission to access this resource.');
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get(endpoint.url);
        // Handle the new API response format
        if (response.data.code === 200) {
          // Ensure each row has an id property for DataGrid
          const processedData = (response.data.data || []).map(row => ({
            ...row,
            id: row._id // Use MongoDB _id as the unique identifier
          }));
          setData(processedData);
        } else {
          throw new Error(response.data.message || 'Failed to fetch data');
        }
      } catch (err) {
        logger.error('Error fetching data:', err);
        if (err.response?.status === 403) {
          setError('You do not have permission to access this resource.');
        } else if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
          navigate('/');
        } else {
          setError(err.message || 'An error occurred while fetching data.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setError('Authentication token not found');
      navigate('/');
    }
  }, [location.pathname, token, userPermissions, navigate]);

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
      maxWidth: '100%',
      overflowX: 'hidden',
    }}>
      {/* Breadcrumbs Section */}
      <Box sx={{ 
        px: { xs: 2, sm: 3, md: 4 },
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
        px: { xs: 2, sm: 3, md: 4 },
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
        px: { xs: 2, sm: 3, md: 4 },
        py: 2,
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        width: '100%',
        overflowX: 'hidden',
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
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
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
            }}
          >
            Add New {getBreadcrumbText(location.pathname).slice(0, -1)}
          </Button>

          {/* Search Bar */}
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            flex: { xs: '1', md: '0 1 400px' },
            minWidth: 0, // This is important for text overflow
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
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
                  '& .MuiInputBase-root': {
                    maxWidth: '100%',
                  }
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
                whiteSpace: 'nowrap',
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
        overflowX: 'auto',
      }}>
        <Paper 
          sx={{ 
            width: '100%',
            p: { xs: 2, sm: 3 },
            minHeight: 'calc(100vh - 350px)',
            overflowX: 'auto',
          }}
        >
          {renderContent()}
        </Paper>
      </Box>
    </Box>
  );
};

export default SectionPage; 
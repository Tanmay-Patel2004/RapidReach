import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Breadcrumbs,
  Link,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { 
  People,
  Security,
  AdminPanelSettings,
  Warehouse,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const SectionPage = () => {
  const location = useLocation();

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
        p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        width: '100%',
      }}>
        <Paper 
          sx={{ 
            width: '100%',
            p: { xs: 2, sm: 3 },
            minHeight: 'calc(100vh - 350px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body1" color="textSecondary">
            Content area for {currentSection.title}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default SectionPage; 
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { 
  People,
  Security,
  AdminPanelSettings,
  Warehouse,
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
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

      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 3,
        }}
      >
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
      </Paper>

      {/* Content Area - For future use */}
      <Paper 
        sx={{ 
          p: 3,
          minHeight: '400px',
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
  );
};

export default SectionPage; 
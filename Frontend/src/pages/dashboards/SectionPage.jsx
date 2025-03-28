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
import config from '../../config/env.config';

const columnDefinitions = {
  '/users': [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 150,
      valueGetter: (params) => params.row._id ? `USER-${params.row._id.slice(-6).toUpperCase()}` : 'N/A'
    },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phoneNumber', headerName: 'Phone', width: 130 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 130,
      valueGetter: (params) => params.row.role_id?.name || 'N/A'
    },
    { 
      field: 'isEmailVerified', 
      headerName: 'Verified', 
      width: 100,
      valueGetter: (params) => params.row.isEmailVerified ? 'Yes' : 'No'
    },
  ],
  '/permissions': [
    // ... existing permissions code ...
  ],
  '/roles': [
    // ... existing roles code ...
  ],
  '/permission-relations': [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 150,
      valueGetter: (params) => params.row._id ? `REL-${params.row._id.slice(-6).toUpperCase()}` : 'N/A'
    },
    { 
      field: 'roleName', 
      headerName: 'Role', 
      width: 200,
      valueGetter: (params) => params.row.roleId?.name || 'N/A'
    },
    { 
      field: 'permissionName', 
      headerName: 'Permission', 
      width: 200,
      valueGetter: (params) => params.row.permissionId?.name || 'N/A'
    }
  ],
  '/warehouse': [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 150,
      valueGetter: (params) => params.row._id ? `WH-${params.row._id.slice(-6).toUpperCase()}` : 'N/A'
    },
    { 
      field: 'warehouseCode', 
      headerName: 'Warehouse Code', 
      width: 150 
    },
    { 
      field: 'zipCode', 
      headerName: 'Zip Code', 
      width: 130,
      valueGetter: (params) => params.row.address?.zipCode || 'N/A'
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      valueGetter: (params) => params.row.status || 'Open'
    }
  ],
}; 

const SectionPage = () => {
  // ... existing code ...

  // Create axios instance with default config
  const axiosInstance = axios.create({
    baseURL: config.api.baseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // ... rest of the code ...
}

export default SectionPage; 
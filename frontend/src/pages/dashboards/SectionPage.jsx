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
import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Snackbar,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom";
import {
  People,
  Security,
  AdminPanelSettings,
  Warehouse,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  selectToken,
  selectUserPermissions,
} from "../../store/slices/authSlice";
import logger from "../../utils/logger";

const SectionPage = () => {
  const token = useSelector(selectToken);
  const userPermissions = useSelector(selectUserPermissions);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [roles, setRoles] = useState([]);

  // Configuration object for section details
  const sectionConfig = {
    "/users": {
      title: "User Management",
      icon: <People sx={{ fontSize: 40, color: "#1976d2" }} />,
      description: "Manage system users and their access",
    },
    "/roles": {
      title: "Role Management",
      icon: <AdminPanelSettings sx={{ fontSize: 40, color: "#1976d2" }} />,
      description: "Configure user roles and their capabilities",
    },
    "/permissions": {
      title: "Permission Management",
      icon: <Security sx={{ fontSize: 40, color: "#1976d2" }} />,
      description: "Define and manage system permissions",
    },
    "/permission-relations": {
      title: "Permission Relations",
      icon: <Security sx={{ fontSize: 40, color: "#1976d2" }} />,
      description: "Manage relationships between permissions",
    },
    "/warehouse": {
      title: "Warehouse Management",
      icon: <Warehouse sx={{ fontSize: 40, color: "#1976d2" }} />,
      description: "Manage warehouse operations and inventory",
    },
  };

  const currentSection = sectionConfig[location.pathname] || {
    title: "404 - Not Found",
    icon: null,
    description: "The requested section does not exist",
  };

  // Function to generate breadcrumb text
  const getBreadcrumbText = (path) => {
    return path.charAt(1).toUpperCase() + path.slice(2).replace(/-/g, " ");
  };

  // Get placeholder text based on current section
  const getSearchPlaceholder = () => {
    const section = location.pathname.slice(1);
    return `Search ${
      section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, " ")
    }...`;
  };

  // Column definitions for different sections
  const columnDefinitions = {
    "/users": [
      {
        field: "id",
        headerName: "ID",
        width: 150,
        valueGetter: (params) =>
          params ? `USER-${params.slice(-6).toUpperCase()}` : "N/A",
      },
      { field: "name", headerName: "Name", width: 150 },
      { field: "email", headerName: "Email", width: 200 },
      { field: "phoneNumber", headerName: "Phone", width: 130 },
      {
        field: "role_id",
        headerName: "Role",
        width: 130,
        valueGetter: (params) =>
          params?.name
            ? params.name.charAt(0).toUpperCase() + params.name.slice(1)
            : "N/A",
      },
      {
        field: "isEmailVerified",
        headerName: "Verified",
        width: 100,
        valueGetter: (params) => (params?.row?.isEmailVerified ? "Yes" : "No"),
      },
    ],
    "/permissions": [
      {
        field: "id",
        headerName: "ID",
        width: 150,
        valueGetter: (params) =>
          params ? `PERM-${params.slice(-6).toUpperCase()}` : "N/A",
      },
      {
        field: "permission_id",
        headerName: "Permission ID",
        width: 130,
      },
      { field: "name", headerName: "Permission Name", width: 200 },

      {
        field: "title",
        headerName: "Title",
        width: 200,
      },
      {
        field: "description",
        headerName: "Description",
        width: 250,
      },
      {
        field: "sectionName",
        headerName: "Section",
        width: 150,
      },
      {
        field: "isActive",
        headerName: "Status",
        width: 120,
      },
    ],
    "/roles": [
      {
        field: "id",
        headerName: "ID",
        width: 150,
        valueGetter: (params) =>
          params ? `ROLE-${params.slice(-6).toUpperCase()}` : "N/A",
      },
      {
        field: "name",
        headerName: "Role Name",
        width: 200,
      },
      { field: "description", headerName: "Description", width: 300 },
      // { field: 'usersCount', headerName: 'Users', width: 130 }
    ],
    "/permission-relations": [
      {
        field: "id",
        headerName: "ID",
        width: 150,
        valueGetter: (params) =>
          params ? `REL-${params.slice(-6).toUpperCase()}` : "N/A",
      },
      {
        field: "roleId",
        headerName: "Role",
        width: 200,
        valueGetter: (params) => params?.name || "N/A",
      },
      {
        field: "permissionId",
        headerName: "Permission",
        width: 200,
        valueGetter: (params) => params?.name || "N/A",
      },
    ],
    "/warehouse": [
      {
        field: "id",
        headerName: "ID",
        width: 150,
        valueGetter: (params) =>
          params ? `WH-${params.slice(-6).toUpperCase()}` : "N/A",
      },
      {
        field: "warehouseCode",
        headerName: "Warehouse Code",
        width: 150,
      },
      {
        field: "street",
        headerName: "Street",
        width: 200,
      },
      {
        field: "province",
        headerName: "Province",
        width: 150,
        valueGetter: (params) => {
          if (!params || !params.row || !params.row.address) return "N/A";
          return params.row.address.province || "N/A";
        },
      },
      {
        field: "country",
        headerName: "Country",
        width: 150,
        valueGetter: (params) => {
          if (!params || !params.row || !params.row.address) return "N/A";
          return params.row.address.country || "N/A";
        },
      },
      {
        field: "zipCode",
        headerName: "ZIP Code",
        width: 120,
        valueGetter: (params) => {
          if (!params || !params.row || !params.row.address) return "N/A";
          return params.row.address.zipCode || "N/A";
        },
      },
    ],
  };

  // Create axios instance with default config
  const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
      "Content-Type": "application/json",
    },
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
            logger.error("Unauthorized access");
            setError("Session expired. Please login again.");
            navigate("/");
            break;
          case 403:
            logger.error("Forbidden access");
            setError("You do not have permission to access this resource.");
            break;
          case 404:
            logger.error("Resource not found");
            setError("Resource not found.");
            break;
          default:
            logger.error("API Error:", error.response.data);
            setError(
              error.response.data.message ||
                "An error occurred while fetching data."
            );
        }
      } else if (error.request) {
        logger.error("Network error");
        setError("Network error. Please check your connection.");
      } else {
        logger.error("Unexpected error:", error);
        setError("An unexpected error occurred.");
      }
      return Promise.reject(error);
    }
  );

  // API endpoint mapping with permission checks
  const apiEndpoints = {
    "/users": {
      url: "/users",
      requiredPermissionId: 1, // Replace with actual permission ID for viewing users
    },
    "/permissions": {
      url: "/permissions",
      requiredPermissionId: 2, // Replace with actual permission ID for viewing permissions
    },
    "/roles": {
      url: "/roles",
      requiredPermissionId: 3, // Replace with actual permission ID for viewing roles
    },
    "/permission-relations": {
      url: "/role-permissions",
      requiredPermissionId: 4, // Replace with actual permission ID for viewing role permissions
    },
    "/warehouse": {
      url: "/warehouses",
      requiredPermissionId: 5, // Replace with actual permission ID for viewing warehouses
    },
  };

  // Add this new function to fetch roles
  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get("/roles");
      if (response.data.code === 200) {
        setRoles(response.data.data || []);
      }
    } catch (error) {
      logger.error("Error fetching roles:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch roles",
        severity: "error",
      });
    }
  };

  // Move fetchData outside useEffect and make it available throughout the component
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = apiEndpoints[location.pathname];
      if (!endpoint) {
        throw new Error("Invalid endpoint");
      }

      // Check if user has required permission
      const hasPermission = userPermissions.some(
        (permission) =>
          Number(permission.permission_id) ===
          Number(endpoint.requiredPermissionId)
      );

      if (!hasPermission) {
        logger.warn("Permission denied:", {
          requiredPermissionId: endpoint.requiredPermissionId,
          userPermissions: userPermissions.map((p) => p.permission_id),
        });
        setError("You do not have permission to access this resource.");
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(endpoint.url);
      if (response.data.code === 200) {
        const processedData = (response.data.data || []).map((row) => ({
          ...row,
          id: row._id,
        }));
        setData(processedData);
      } else {
        throw new Error(response.data.message || "Failed to fetch data");
      }
    } catch (err) {
      logger.error("Error fetching data:", err);
      if (err.response?.status === 403) {
        setError("You do not have permission to access this resource.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        navigate("/");
      } else {
        setError(err.message || "An error occurred while fetching data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to use the moved fetchData function
  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setError("Authentication token not found");
      navigate("/");
    }
  }, [location.pathname, token, userPermissions, navigate]);

  // Add error display component
  const ErrorDisplay = ({ message }) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        textAlign: "center",
      }}>
      <Typography variant="h6" color="error" gutterBottom>
        Error
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
      {message.includes("login") && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate("/")}>
          Go to Login
        </Button>
      )}
    </Box>
  );

  // Render content based on loading/error state
  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <ErrorDisplay message={error} />;
    }

    if (!data.length) {
      return (
        <Box sx={{ textAlign: "center", p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
      );
    }

    return (
      <DataGrid
        rows={data}
        columns={enhancedColumnDefinitions[location.pathname] || []}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection
        disableSelectionOnClick
        autoHeight
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #f0f0f0",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f5f5f5",
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "#fff",
          },
        }}
      />
    );
  };

  // Function to handle dialog open
  const handleDialogOpen = (mode, item = null) => {
    setDialogMode(mode);
    setSelectedItem(item);

    if (mode === "edit" && item) {
      // Format the date to YYYY-MM-DD for the date input
      const formattedDate = item.dateOfBirth
        ? new Date(item.dateOfBirth).toISOString().split("T")[0]
        : "";

      // Properly structure the form data for editing
      const editFormData = {
        ...item,
        dateOfBirth: formattedDate,
        role_id: item.role_id || "",
        address: {
          street: item.address?.street || "",
          unitNumber: item.address?.unitNumber || "",
          province: item.address?.province || "",
          country: item.address?.country || "",
          zipCode: item.address?.zipCode || "",
        },
      };
      setFormData(editFormData);
    } else {
      setFormData({});
    }

    setOpenDialog(true);

    // Fetch roles when opening the users form
    if (location.pathname === "/users") {
      fetchRoles();
    }
  };

  // Function to handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({});
  };

  // Update handleSubmit function
const handleSubmit = async () => {
  try {
    const endpoint = apiEndpoints[location.pathname];
    let response;
    let dataToSubmit = { ...formData };

    // Special handling for user data
    if (location.pathname === "/users") {
      if (dataToSubmit.dateOfBirth) {
        dataToSubmit.dateOfBirth = new Date(
          dataToSubmit.dateOfBirth
        ).toISOString();
      }

      if (dialogMode === "edit" && !dataToSubmit.password) {
        delete dataToSubmit.password;
      }

      if (dataToSubmit.role_id) {
        dataToSubmit.role_id = dataToSubmit.role_id;
      } else {
        dataToSubmit.role_id = "67bb9c6aee11822f1295c3e3";
      }

      if (dataToSubmit.address) {
        dataToSubmit.address = {
          street: dataToSubmit.address.street || "",
          unitNumber: dataToSubmit.address.unitNumber || "",
          province: dataToSubmit.address.province || "",
          country: dataToSubmit.address.country || "",
          zipCode: dataToSubmit.address.zipCode || "",
        };
      }

      dataToSubmit = {
        ...dataToSubmit,
        isEmailVerified: false,
      };
    }

    // Special handling for warehouse data
    if (location.pathname === "/warehouse") {
      if (dataToSubmit.warehouseCode) {
        dataToSubmit.warehouseCode = dataToSubmit.warehouseCode.toUpperCase();
      }
    }

    if (dialogMode === "add") {
      response = await axiosInstance.post(endpoint.url, dataToSubmit);
      console.log("Add response:", response.data); // Debug log
    } else {
      response = await axiosInstance.put(
        `${endpoint.url}/${selectedItem.id}`,
        dataToSubmit
      );
      console.log("Update response:", response.data); // Debug log
    }

    // Check the response status
    if (response.status === 200 || response.status === 201) {
      // Handle both 200 and 201 as success
      // Close the dialog and clear the form
      setOpenDialog(false);
      setSelectedItem(null);
      setFormData({});

      // Show success message
      setSnackbar({
        open: true,
        message:
          dialogMode === "add"
            ? `New ${getBreadcrumbText(location.pathname)
                .slice(0, -1)
                .toLowerCase()} added successfully!`
            : `${getBreadcrumbText(location.pathname).slice(
                0,
                -1
              )} updated successfully!`,
        severity: "success",
      });

      // Refresh the data immediately
      await fetchData();
    } else {
      // If the response status is not 200 or 201, treat it as an error
      setSnackbar({
        open: true,
        message: response.data.message || "Failed to save data",
        severity: "error",
      });
    }
  } catch (error) {
    console.error("Submission error:", error);
    setSnackbar({
      open: true,
      message: error.message || "An error occurred while saving the data",
      severity: "error",
    });
  }
};

  // Function to handle delete
  const handleDelete = async (id) => {
    try {
      const endpoint = apiEndpoints[location.pathname];
      const response = await axiosInstance.delete(`${endpoint.url}/${id}`);

      if (response.data.code === 200) {
        setSnackbar({
          open: true,
          message: "Successfully deleted item",
          severity: "success",
        });
        // Refresh data
        fetchData();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "An error occurred",
        severity: "error",
      });
    }
  };

  // Add action column to all column definitions
  const getColumnsWithActions = (columns) => [
    ...columns,
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleDialogOpen("edit", params.row)}
            size="small"
            color="primary">
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            size="small"
            color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Update columnDefinitions to include actions
  const enhancedColumnDefinitions = Object.entries(columnDefinitions).reduce(
    (acc, [key, columns]) => ({
      ...acc,
      [key]: getColumnsWithActions(columns),
    }),
    {}
  );

  // Function to get form fields based on current section
  const getFormFields = () => {
    switch (location.pathname) {
      case "/users":
        return [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          {
            name: "password",
            label: "Password",
            type: "password",
            required: dialogMode === "add", // Only required for new users
            minLength: 6,
          },
          {
            name: "role_id",
            label: "Role",
            type: "select",
            required: true,
            options: roles.map((role) => ({
              value: role._id,
              label: role.name,
            })),
          },
          {
            name: "dateOfBirth",
            label: "Date of Birth",
            type: "date",
            required: true,
          },
          {
            name: "phoneNumber",
            label: "Phone Number",
            type: "text",
            required: false,
          },
          {
            name: "address.street",
            label: "Street Address",
            type: "text",
            required: false,
          },
          {
            name: "address.unitNumber",
            label: "Unit Number",
            type: "text",
            required: false,
          },
          {
            name: "address.province",
            label: "Province",
            type: "text",
            required: false,
          },
          {
            name: "address.country",
            label: "Country",
            type: "text",
            required: false,
          },
          {
            name: "address.zipCode",
            label: "ZIP/Postal Code",
            type: "text",
            required: false,
            pattern: "^[A-Za-z0-9\\s-]+$",
          },
        ];
      case "/roles":
        return [
          { name: "name", label: "Role Name", type: "text", required: true },
          {
            name: "description",
            label: "Description",
            type: "text",
            required: true,
          },
          {
            name: "isActive",
            label: "Status",
            type: "select",
            required: true,
            options: ["true", "false"],
            valueGetter: (value) => value === "true",
          },
        ];
      case "/permissions":
        return [
          {
            name: "permission_id",
            label: "Permission ID",
            type: "number",
            required: true,
            helperText: "Unique numeric identifier for the permission",
          },
          {
            name: "name",
            label: "Permission Name",
            type: "text",
            required: true,
            helperText: "Unique name for the permission",
          },
          {
            name: "title",
            label: "Title",
            type: "text",
            required: true,
            helperText: "Display title for the permission",
          },
          {
            name: "description",
            label: "Description",
            type: "text",
            required: true,
            helperText: "Detailed description of the permission",
          },
          {
            name: "sectionName",
            label: "Section Name",
            type: "text",
            required: true,
            helperText: "Section/module this permission belongs to",
          },
          {
            name: "isActive",
            label: "Status",
            type: "select",
            required: true,
            options: ["true", "false"],
            valueGetter: (value) => value === "true",
            helperText: "Whether this permission is active",
          },
        ];
      case "/warehouse":
        return [
          {
            name: "warehouseCode",
            label: "Warehouse Code",
            type: "text",
            required: true,
            helperText:
              "Unique warehouse identifier (will be converted to uppercase)",
          },
          {
            name: "address.street",
            label: "Street Address",
            type: "text",
            required: true,
            helperText: "Street address of the warehouse",
          },
          {
            name: "address.province",
            label: "Province",
            type: "text",
            required: true,
            helperText: "Province where warehouse is located",
          },
          {
            name: "address.country",
            label: "Country",
            type: "text",
            required: true,
            helperText: "Country where warehouse is located",
          },
          {
            name: "address.zipCode",
            label: "ZIP/Postal Code",
            type: "text",
            required: true,
            pattern: "^[A-Za-z0-9\\s-]+$",
            helperText: "Only letters, numbers, spaces, and hyphens allowed",
          },
        ];
      default:
        return [];
    }
  };

  // Update form data handling for nested fields
  const handleFormChange = (e, field) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      // Handle nested fields (e.g., address.street)
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else if (field.valueGetter) {
      // Handle fields with value transformations
      setFormData((prev) => ({
        ...prev,
        [name]: field.valueGetter(value),
      }));
    } else {
      // Handle regular fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Update the Add New button click handler
  const handleAddNew = () => {
    handleDialogOpen("add");
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}>
      {/* Breadcrumbs Section */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 2,
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          width: "100%",
        }}>
        <Breadcrumbs>
          <Link
            color="inherit"
            href="/dashboard"
            sx={{
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}>
            Dashboard
          </Link>
          <Typography color="text.primary">
            {getBreadcrumbText(location.pathname)}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header Section */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 3,
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          width: "100%",
        }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
            background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
            borderRadius: 2,
            width: "100%",
          }}>
          {/* Title Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 3,
            }}>
            {/* Icon */}
            <Box
              sx={{
                p: 2,
                borderRadius: "50%",
                background: "white",
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              {currentSection.icon}
            </Box>

            {/* Title and Description */}
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 600,
                  color: "#1a3b61",
                  mb: 1,
                }}>
                {currentSection.title}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: "#5c7184" }}>
                {currentSection.description}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Actions Row */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 2,
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          width: "100%",
          overflowX: "hidden",
        }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
            width: "100%",
            maxWidth: "100%",
            overflowX: "hidden",
          }}>
          {/* Add New Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              height: "48px",
              px: 3,
              whiteSpace: "nowrap",
              minWidth: "fit-content",
            }}>
            Add New {getBreadcrumbText(location.pathname).slice(0, -1)}
          </Button>

          {/* Search Bar */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flex: { xs: "1", md: "0 1 400px" },
              minWidth: 0, // This is important for text overflow
              width: "100%",
              maxWidth: "100%",
              overflowX: "hidden",
            }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={getSearchPlaceholder()}
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: "#f5f5f5",
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                  "& .MuiInputBase-root": {
                    maxWidth: "100%",
                  },
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
                minWidth: "100px",
                whiteSpace: "nowrap",
              }}>
              Search
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          width: "100%",
          overflowX: "auto",
        }}>
        <Paper
          sx={{
            width: "100%",
            p: { xs: 2, sm: 3 },
            minHeight: "calc(100vh - 350px)",
            overflowX: "auto",
          }}>
          {renderContent()}
        </Paper>
      </Box>

      {/* Add Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>
          {dialogMode === "add" ? "Add New" : "Edit"}{" "}
          {getBreadcrumbText(location.pathname).slice(0, -1)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {getFormFields().map((field) => (
              <TextField
                key={field.name}
                fullWidth
                margin="normal"
                label={field.label}
                name={field.name}
                type={field.type}
                required={field.required}
                value={
                  field.name.includes(".")
                    ? formData[field.name.split(".")[0]]?.[
                        field.name.split(".")[1]
                      ] || ""
                    : formData[field.name] || ""
                }
                onChange={(e) => handleFormChange(e, field)}
                select={field.type === "select"}
                error={field.required && !formData[field.name]}
                helperText={field.helperText}
                inputProps={{
                  minLength: field.minLength,
                  pattern: field.pattern,
                }}>
                {field.type === "select" &&
                  (field.name === "role_id"
                    ? field.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))
                    : field.options.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option === "true"
                            ? "Active"
                            : option === "false"
                            ? "Inactive"
                            : option}
                        </MenuItem>
                      )))}
              </TextField>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData || Object.keys(formData).length === 0}>
            {dialogMode === "add" ? "Add" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SectionPage;

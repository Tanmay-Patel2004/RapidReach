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
  Card,
  CardContent,
  useTheme,
  alpha,
  Chip,
  Tooltip,
  Fade,
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
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  selectToken,
  selectUserPermissions,
} from "../../store/slices/authSlice";
import logger from "../../utils/logger";

const SectionPage = () => {
  const theme = useTheme();
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
  const [permissions, setPermissions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Configuration object for section details
  const sectionConfig = {
    "/users": {
      title: "User Management",
      icon: <People sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      description: "Manage system users and their access",
    },
    "/roles": {
      title: "Role Management",
      icon: (
        <AdminPanelSettings
          sx={{ fontSize: 40, color: theme.palette.primary.main }}
        />
      ),
      description: "Configure user roles and their capabilities",
    },
    "/permissions": {
      title: "Permission Management",
      icon: (
        <Security sx={{ fontSize: 40, color: theme.palette.primary.main }} />
      ),
      description: "Define and manage system permissions",
    },
    "/permission-relations": {
      title: "Permission Relations",
      icon: (
        <Security sx={{ fontSize: 40, color: theme.palette.primary.main }} />
      ),
      description: "Manage relationships between permissions",
    },
    "/warehouse": {
      title: "Warehouse Management",
      icon: (
        <Warehouse sx={{ fontSize: 40, color: theme.palette.primary.main }} />
      ),
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
        renderCell: (params) => (
          <Chip
            label={params?.row?.role_id?.name || "N/A"}
            size="small"
            color={
              params?.row?.role_id?.name === "super admin"
                ? "primary"
                : "default"
            }
          />
        ),
      },
      {
        field: "isEmailVerified",
        headerName: "Verified",
        width: 100,
        renderCell: (params) => (
          <Chip
            label={params?.row?.isEmailVerified ? "Yes" : "No"}
            size="small"
            color={params?.row?.isEmailVerified ? "success" : "error"}
          />
        ),
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
        renderCell: (params) => (
          <Chip
            label={params.row.isActive ? "Active" : "Inactive"}
            size="small"
            color={params.row.isActive ? "success" : "default"}
          />
        ),
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
      // {
      //   field: "id",
      //   headerName: "ID",
      //   width: 150,
      //   valueGetter: (params) =>
      //     params.value ? `WH-${params.value.slice(-6).toUpperCase()}` : "N/A",
      // },
      {
        field: "warehouseCode",
        headerName: "Warehouse Code",
        width: 150,
        renderCell: (params) => (
          <Chip
            label={params.row.warehouseCode}
            size="small"
            color="primary"
            variant="outlined"
          />
        ),
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
      },
      {
        field: "country",
        headerName: "Country",
        width: 150,
      },
      {
        field: "zipCode",
        headerName: "ZIP Code",
        width: 120,
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

  // Add this new function to fetch permissions
  const fetchPermissions = async () => {
    try {
      const response = await axiosInstance.get("/permissions");
      if (response.data.code === 200) {
        setPermissions(response.data.data || []);
      }
    } catch (error) {
      logger.error("Error fetching permissions:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch permissions",
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

      // Add logging for debugging warehouse data
      if (location.pathname === "/warehouse") {
        logger.info("Warehouse API response:", {
          status: response.status,
          statusText: response.statusText,
          dataCode: response.data?.code,
          dataCount: response.data?.data?.length,
          sampleData: response.data?.data?.[0],
        });
      }

      if (response.data.code === 200) {
        let processedData = (response.data.data || []).map((row) => ({
          ...row,
          id: row._id,
        }));

        // Special processing for warehouse data
        if (location.pathname === "/warehouse") {
          // Enhanced logging to debug address data
          logger.info("Raw warehouse data:", {
            count: processedData.length,
            sampleData: processedData[0],
            addressSample: processedData[0]?.address,
          });

          // For warehouse data, flatten the address object for proper display in DataGrid
          processedData = processedData.map((warehouse) => {
            // Create a flattened version that keeps both the original and adds direct access properties
            const flattenedWarehouse = {
              ...warehouse,
              // Add direct access properties for the DataGrid to use
              street: warehouse.address?.street || "N/A",
              province: warehouse.address?.province || "N/A",
              country: warehouse.address?.country || "N/A",
              zipCode: warehouse.address?.zipCode || "N/A",
            };

            return flattenedWarehouse;
          });

          // Log the processed data
          logger.info("Processed warehouse data with flattened address:", {
            count: processedData.length,
            sample: processedData[0],
          });
        }

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
        p: 5,
        textAlign: "center",
        height: "300px",
      }}>
      <Box
        sx={{
          bgcolor: alpha(theme.palette.error.main, 0.1),
          p: 2,
          borderRadius: "50%",
          mb: 2,
        }}>
        <IconButton
          color="error"
          sx={{
            p: 0,
            cursor: "default",
            "&:hover": { bgcolor: "transparent" },
          }}>
          <Security sx={{ fontSize: 40 }} />
        </IconButton>
      </Box>
      <Typography variant="h6" color="error.main" gutterBottom>
        Error
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: "500px", mb: 3 }}>
        {message}
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        {message.includes("login") && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}>
            Go to Login
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchData}>
          Try Again
        </Button>
      </Box>
    </Box>
  );

  // Render content based on loading/error state
  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}>
          <CircularProgress size={40} thickness={4} />
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            Loading data...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return <ErrorDisplay message={error} />;
    }

    if (!data.length) {
      return (
        <Box
          sx={{
            textAlign: "center",
            p: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            color: "text.secondary",
          }}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              p: 2,
              borderRadius: "50%",
              mb: 2,
            }}>
            {currentSection.icon}
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {getBreadcrumbText(location.pathname).toLowerCase()} found
          </Typography>
          <Typography variant="body2">
            Get started by adding your first{" "}
            {getBreadcrumbText(location.pathname).slice(0, -1).toLowerCase()}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{ mt: 3 }}>
            Add New {getBreadcrumbText(location.pathname).slice(0, -1)}
          </Button>
        </Box>
      );
    }

    // Filter data if search term exists
    const filteredData = searchTerm
      ? data.filter((row) => {
          // Basic search through all string properties
          return Object.keys(row).some((key) => {
            if (typeof row[key] === "string") {
              return row[key].toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
          });
        })
      : data;

    return (
      <DataGrid
        rows={filteredData}
        columns={enhancedColumnDefinitions[location.pathname] || []}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection
        disableSelectionOnClick
        autoHeight
        loading={loading}
        sx={{
          border: "none",
          borderRadius: 2,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor:
              theme.palette.mode === "light"
                ? alpha(theme.palette.primary.main, 0.05)
                : alpha(theme.palette.primary.dark, 0.15),
            borderRadius: "8px 8px 0 0",
          },
          "& .MuiDataGrid-row": {
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha(theme.palette.primary.main, 0.04)
                  : alpha(theme.palette.primary.dark, 0.08),
            },
            "&.Mui-selected": {
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.primary.dark, 0.16),
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "light"
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.primary.dark, 0.24),
              },
            },
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: `1px solid ${theme.palette.divider}`,
          },
          "& .MuiDataGrid-main": {
            width: "100%",
          },
          "& .MuiDataGrid-columnHeader": {
            py: 1.5,
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
          },
          "& .MuiDataGrid-cell": {
            fontSize: "0.875rem",
            py: 1,
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
      // Make a copy of the item to avoid directly modifying it
      let editData = { ...item };

      // If dateOfBirth exists, convert it to YYYY-MM-DD format for the date input
      let formattedDate = "";
      if (editData.dateOfBirth) {
        const date = new Date(editData.dateOfBirth);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split("T")[0];
        }
      }

      // If isEmailVerified exists, convert boolean to string for select input
      if (editData.isEmailVerified !== undefined) {
        // Convert to string "true" or "false" for the select field
        editData.isEmailVerified = editData.isEmailVerified ? "true" : "false";
      }

      // Check if we're editing a permission relation
      if (location.pathname === "/permission-relations") {
        console.log("Editing permission relation:", item);
        // Make sure roleId and permissionId are properly extracted from their objects
        editData.roleId = item.roleId?._id || item.roleId || "";
        editData.permissionId =
          item.permissionId?._id || item.permissionId || "";
      }

      // Properly structure the form data for editing
      const editFormData = {
        ...editData,
        dateOfBirth: formattedDate,
        role_id: item.role_id?._id || item.role_id || "",
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

    // Fetch roles when opening the users form or permission relations form
    if (
      location.pathname === "/users" ||
      location.pathname === "/permission-relations"
    ) {
      fetchRoles();
    }

    // Fetch permissions when opening the permission relations form
    if (location.pathname === "/permission-relations") {
      fetchPermissions();
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
      setSubmitting(true);
      setSubmitError(null);

      const endpoint = apiEndpoints[location.pathname];
      if (!endpoint) {
        throw new Error("Invalid endpoint");
      }

      let response;
      let dataToSubmit = { ...formData };

      // Add any special handling for specific endpoints here
      if (location.pathname === "/users") {
        // Handle user-specific data transformation
        if (dialogMode === "add") {
          // Validate required fields for user creation
          if (!dataToSubmit.password) {
            setSubmitError("Password is required");
            return;
          }

          if (dataToSubmit.password !== dataToSubmit.confirmPassword) {
            setSubmitError("Passwords do not match");
            return;
          }

          // Remove isEmailVerified from new user creation - will use server default
          delete dataToSubmit.isEmailVerified;
        } else if (dialogMode === "edit") {
          // Ensure isEmailVerified is properly formatted as boolean for user updates
          if (dataToSubmit.isEmailVerified !== undefined) {
            dataToSubmit.isEmailVerified = Boolean(
              dataToSubmit.isEmailVerified
            );
          }
        }

        // Don't send confirmPassword to API
        delete dataToSubmit.confirmPassword;

        // Handle address fields for users
        const addressFields = {};

        // Extract address fields from dataToSubmit and structure them properly
        for (const key in dataToSubmit) {
          if (key.startsWith("address.")) {
            const addressField = key.split(".")[1];
            addressFields[addressField] = dataToSubmit[key];
            // Remove the flat address.field property
            delete dataToSubmit[key];
          }
        }

        // Only set address if we have address fields
        if (Object.keys(addressFields).length > 0) {
          dataToSubmit.address = addressFields;
        }

        logger.info("Structured user data with address:", dataToSubmit);
      }

      // Special handling for permission relations
      if (location.pathname === "/permission-relations") {
        // Check if both roleId and permissionId are selected
        if (!dataToSubmit.roleId || !dataToSubmit.permissionId) {
          setSubmitError("Both Role and Permission must be selected");
          return;
        }

        // Remove unnecessary fields that might cause server-side issues
        if (
          dataToSubmit.roleId &&
          typeof dataToSubmit.roleId === "object" &&
          dataToSubmit.roleId._id
        ) {
          dataToSubmit.roleId = dataToSubmit.roleId._id;
        }

        if (
          dataToSubmit.permissionId &&
          typeof dataToSubmit.permissionId === "object" &&
          dataToSubmit.permissionId._id
        ) {
          dataToSubmit.permissionId = dataToSubmit.permissionId._id;
        }

        // Log the permission relation data being submitted
        logger.info("Preparing permission relation data:", dataToSubmit);
      }

      // Special handling for warehouse data
      if (location.pathname === "/warehouse") {
        // Log the warehouse data being submitted
        logger.info("Preparing warehouse data submission:", dataToSubmit);

        // Ensure warehouseCode is uppercase
        if (dataToSubmit.warehouseCode) {
          dataToSubmit.warehouseCode = dataToSubmit.warehouseCode.toUpperCase();
        }

        // Ensure address is properly structured as a nested object
        const addressFields = {};

        // Extract address fields from dataToSubmit and structure them properly
        for (const key in dataToSubmit) {
          if (key.startsWith("address.")) {
            const addressField = key.split(".")[1];
            addressFields[addressField] = dataToSubmit[key];
            // Remove the flat address.field property
            delete dataToSubmit[key];
          }
        }

        // Only set address if we have address fields
        if (Object.keys(addressFields).length > 0) {
          dataToSubmit.address = addressFields;
        }

        // Log the restructured data
        logger.info("Restructured warehouse data:", dataToSubmit);
      }

      try {
        // For update operations
        if (dialogMode === "edit") {
          // Log the update data for debugging
          logger.info(
            `Updating ${location.pathname.slice(1)} with data:`,
            dataToSubmit
          );

          // Special handling for permission relations update
          let updateUrl = `${endpoint.url}/${selectedItem.id}`;
          if (location.pathname === "/permission-relations") {
            logger.info(
              "Updating permission relation with ID:",
              selectedItem.id
            );
          }

          response = await axiosInstance.put(updateUrl, dataToSubmit);
        } else {
          // For create operations
          logger.info(
            `Creating new ${location.pathname.slice(1)} with data:`,
            dataToSubmit
          );

          response = await axiosInstance.post(endpoint.url, dataToSubmit);
        }

        if (response.data.code === 200 || response.data.code === 201) {
          setSnackbar({
            open: true,
            message: response.data.message || "Data saved successfully",
            severity: "success",
          });
          handleDialogClose();
          fetchData(); // Refresh the data
        } else {
          setSubmitError(response.data.message || "Failed to save data");
          setSnackbar({
            open: true,
            message: response.data.message || "Failed to save data",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Submission error:", error);
        setSubmitError(error.message || "An error occurred");
        setSnackbar({
          open: true,
          message:
            error.response?.data?.message ||
            error.message ||
            "An error occurred while saving the data",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Validation error:", error);
      setSubmitError(error.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle delete
  const handleDelete = async (id) => {
    try {
      const endpoint = apiEndpoints[location.pathname];

      // Add logging for role-permission relations
      if (location.pathname === "/permission-relations") {
        console.log("Deleting permission relation with ID:", id);
      }

      const response = await axiosInstance.delete(`${endpoint.url}/${id}`);
      console.log("Delete response:", response.data); // Debug log

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
      console.error("Delete error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }

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
            name: "confirmPassword",
            label: "Confirm Password",
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
          // Only show Email Verification field in edit mode
          ...(dialogMode === "edit"
            ? [
                {
                  name: "isEmailVerified",
                  label: "Email Verified",
                  type: "select",
                  required: false,
                  options: ["true", "false"],
                  valueGetter: (value) => value === "true",
                  helperText: "Update email verification status of the user",
                },
              ]
            : []),
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
      case "/permission-relations":
        return [
          {
            name: "roleId",
            label: "Role",
            type: "select",
            required: true,
            options: roles.map((role) => ({
              value: role._id,
              label: role.name,
            })),
            helperText: "Select the role to assign permissions to",
          },
          {
            name: "permissionId",
            label: "Permission",
            type: "select",
            required: true,
            options: permissions.map((permission) => ({
              value: permission._id,
              label: `${permission.name} (${permission.title})`,
            })),
            helperText: "Select the permission to assign to the role",
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
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
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
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          width: "100%",
        }}>
        <Card
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            background: theme.palette.background.gradient,
            borderRadius: 2,
            width: "100%",
            overflow: "hidden",
            position: "relative",
          }}>
          {/* Add decorative circles for design */}
          <Box
            sx={{
              position: "absolute",
              right: -50,
              top: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: alpha(theme.palette.primary.main, 0.1),
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 100,
              bottom: -70,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: alpha(theme.palette.primary.main, 0.05),
              zIndex: 0,
            }}
          />

          {/* Title Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 3,
              position: "relative",
              zIndex: 1,
            }}>
            {/* Icon */}
            <Box
              sx={{
                p: 2,
                borderRadius: "50%",
                background: theme.palette.background.paper,
                boxShadow: theme.shadows[3],
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
                  color: theme.palette.text.primary,
                  mb: 1,
                }}>
                {currentSection.title}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: theme.palette.text.secondary,
                  maxWidth: "600px",
                }}>
                {currentSection.description}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Actions Row */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 2,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
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
          {/* Left side - Add and action buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
            }}>
            {/* Add New Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{
                height: "40px",
                px: 2,
                whiteSpace: "nowrap",
                minWidth: "fit-content",
                borderRadius: 1,
              }}>
              Add New
            </Button>

            {/* Refresh Button */}
            <Tooltip title="Refresh data">
              <Button
                variant="outlined"
                color="primary"
                onClick={fetchData}
                sx={{
                  height: "40px",
                  minWidth: "40px",
                  width: "40px",
                  p: 0,
                }}>
                <RefreshIcon fontSize="small" />
              </Button>
            </Tooltip>

            {/* Export Button */}
            <Tooltip title="Export data">
              <Button
                variant="outlined"
                color="primary"
                sx={{
                  height: "40px",
                  minWidth: "40px",
                  width: "40px",
                  p: 0,
                }}>
                <ExportIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Box>

          {/* Search Bar */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flex: { xs: "1", md: "0 1 400px" },
              minWidth: 0,
              width: "100%",
              maxWidth: "100%",
              overflowX: "hidden",
            }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={getSearchPlaceholder()}
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 1,
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                height: "40px",
                minWidth: "40px",
                px: 3,
                whiteSpace: "nowrap",
                borderRadius: 1,
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
        <Card
          sx={{
            width: "100%",
            p: { xs: 1, sm: 0 },
            minHeight: "calc(100vh - 350px)",
            overflowX: "auto",
            boxShadow: theme.shadows[1],
          }}>
          {renderContent()}
        </Card>
      </Box>

      {/* Add Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {dialogMode === "add" ? "Add New" : "Edit"}{" "}
            {getBreadcrumbText(location.pathname).slice(0, -1)}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Box sx={{ pt: 2 }}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}
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
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                  },
                }}>
                {field.type === "select" &&
                  (field.name === "role_id" ||
                  field.name === "roleId" ||
                  field.name === "permissionId"
                    ? field.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))
                    : field.options.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option === "true" && field.name === "isEmailVerified"
                            ? "Verified"
                            : option === "false" &&
                              field.name === "isEmailVerified"
                            ? "Not Verified"
                            : option === "true"
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
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleDialogClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={
              submitting || !formData || Object.keys(formData).length === 0
            }>
            {submitting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                {dialogMode === "add" ? "Adding..." : "Saving..."}
              </>
            ) : dialogMode === "add" ? (
              "Add"
            ) : (
              "Save"
            )}
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
          variant="filled"
          sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SectionPage;

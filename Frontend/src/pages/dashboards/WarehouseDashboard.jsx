import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Stack,
  Card,
  CardContent,
  Grid,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  Inventory as InventoryIcon,
  ListAlt as OrdersIcon,
  CheckCircle as PreparedIcon,
  LocalShipping as ShippingIcon,
  Warehouse as WarehouseIcon,
  AccessTime as PendingIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAuthToken,
  logout,
  selectUser,
} from "../../store/slices/authSlice";

const WarehouseDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const user = useSelector(selectUser);

  const [activeTab, setActiveTab] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [orderDialog, setOrderDialog] = useState({
    open: false,
    order: null,
    notes: "",
  });

  const [statusDialog, setStatusDialog] = useState({
    open: false,
    order: null,
    status: "",
    notes: "",
  });

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    try {
      setRefreshing(true);
      console.log("Fetching pending orders...");

      // Try multiple possible endpoints for orders
      let response;
      let error;

      // Endpoint options to try
      const endpointOptions = [
        "http://localhost:3000/api/orders",
        "http://localhost:3000/api/orders/orders",
      ];

      // Try each endpoint until one works
      for (const endpoint of endpointOptions) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            console.log(`Successful response from ${endpoint}`);
            break; // Exit the loop if we get a successful response
          } else {
            console.log(
              `Endpoint ${endpoint} returned status: ${response.status}`
            );
          }
        } catch (err) {
          console.log(`Error with endpoint ${endpoint}:`, err);
          error = err;
        }
      }

      // If all endpoints failed
      if (!response || !response.ok) {
        throw new Error(
          `Error fetching pending orders: ${error || "All endpoints failed"}`
        );
      }

      const data = await response.json();
      console.log("Orders API response:", data);

      // Handle different response formats
      let ordersArray = [];
      if (Array.isArray(data)) {
        ordersArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        ordersArray = data.data;
      } else if (typeof data === "object") {
        console.log(
          "Unexpected response format, trying to extract orders:",
          data
        );
        // Try to find an array in the response
        for (const key in data) {
          if (Array.isArray(data[key])) {
            ordersArray = data[key];
            console.log(`Found orders array in response.${key}`);
            break;
          }
        }
      }

      console.log(`Found ${ordersArray.length} total orders`);

      // Filter for "Pending" status - check for case variations
      const pendingOrdersArray = ordersArray.filter((order) => {
        const status = order.status?.toLowerCase();
        return status === "pending";
      });

      // Filter for "Ready for Pickup" status - check for case variations
      const readyOrdersArray = ordersArray.filter((order) => {
        const status = order.status?.toLowerCase();
        return status === "ready for pickup";
      });

      console.log(
        `After filtering: ${pendingOrdersArray.length} pending orders, ${readyOrdersArray.length} ready for pickup orders`
      );
      setPendingOrders(pendingOrdersArray || []);
      setReadyOrders(readyOrdersArray || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setSnackbar({
        open: true,
        message: `Failed to fetch orders: ${error.message}`,
        severity: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch ready-for-pickup orders
  const fetchReadyOrders = async () => {
    // We'll use the same fetchPendingOrders function to get all orders and filter them
    await fetchPendingOrders();
  };

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("http://localhost:3000/api/warehouses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching inventory: ${response.status}`);
      }

      const data = await response.json();
      setInventory(data.data || []);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      setSnackbar({
        open: true,
        message: `Failed to fetch inventory: ${error.message}`,
        severity: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Mark order as prepared
  const markOrderAsPrepared = async (orderId) => {
    try {
      setLoading(true);
      console.log(`Marking order ${orderId} as prepared...`);

      // Send request to ready-for-pickup endpoint with notes
      const response = await fetch(
        `http://localhost:3000/api/orders/${orderId}/ready-for-pickup`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes: orderDialog.notes || "Order prepared by warehouse staff",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          errorData.message || `Error updating order: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Order update response:", result);

      // Close dialog and update lists
      setOrderDialog({
        open: false,
        order: null,
        notes: "",
      });

      await fetchPendingOrders();

      setSnackbar({
        open: true,
        message: "Order marked as prepared successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      setSnackbar({
        open: true,
        message: `Failed to update order status: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update order status (back to pending or cancel)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      console.log(`Changing order ${orderId} status to ${newStatus}...`);

      // Get the current order details from statusDialog
      const currentOrder = statusDialog.order;
      console.log("Current order data:", currentOrder);

      // Use the status update endpoint
      const response = await fetch(
        `http://localhost:3000/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            notes:
              statusDialog.notes || `Order ${newStatus} by warehouse staff`,
            // Include required fields
            tax: currentOrder.tax || 0,
            subtotal: currentOrder.subtotal || 0,
            totalAmount: currentOrder.totalAmount || 0,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          errorData.message || `Error updating order: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Order update response:", result);

      // Close dialog and update lists
      setStatusDialog({
        open: false,
        order: null,
        status: "",
        notes: "",
      });

      await fetchPendingOrders();

      setSnackbar({
        open: true,
        message: `Order status changed to ${newStatus} successfully!`,
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      setSnackbar({
        open: true,
        message: `Failed to update order status: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Effect to load data when tab changes
  useEffect(() => {
    if (token) {
      if (activeTab === 0) {
        fetchPendingOrders();
      } else if (activeTab === 1) {
        fetchReadyOrders();
      } else {
        fetchInventory();
      }
    }
  }, [activeTab, token]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Open order processing dialog
  const handleOpenOrderDialog = (order) => {
    setOrderDialog({
      open: true,
      order,
      notes: "",
    });
  };

  // Close order processing dialog
  const handleCloseOrderDialog = () => {
    setOrderDialog({
      open: false,
      order: null,
      notes: "",
    });
  };

  // Open status change dialog
  const handleOpenStatusDialog = (order) => {
    setStatusDialog({
      open: true,
      order,
      status: "Pending",
      notes: "",
    });
  };

  // Close status change dialog
  const handleCloseStatusDialog = () => {
    setStatusDialog({
      open: false,
      order: null,
      status: "",
      notes: "",
    });
  };

  // Snackbar close handler
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}>
        <Typography variant="h4">Warehouse Dashboard</Typography>
      </Box>

      {/* Welcome Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Welcome, {user?.firstName || "Warehouse Staff"}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage warehouse operations, process orders, and track inventory.
          </Typography>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Orders
              </Typography>
              <Typography variant="h3">{pendingOrders.length || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Orders waiting to be processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Warehouses
              </Typography>
              <Typography variant="h3">{inventory.length || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total warehouses in system
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ready for Pickup
              </Typography>
              <Typography variant="h3">{readyOrders.length || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Orders prepared for drivers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="warehouse tabs">
          <Tab
            icon={<PendingIcon />}
            label="PENDING ORDERS"
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab
            icon={<PreparedIcon />}
            label="READY FOR PICKUP"
            id="tab-1"
            aria-controls="tabpanel-1"
          />
          <Tab
            icon={<InventoryIcon />}
            label="INVENTORY"
            id="tab-2"
            aria-controls="tabpanel-2"
          />
        </Tabs>
      </Box>

      {/* Pending Orders Tab */}
      <div
        role="tabpanel"
        hidden={activeTab !== 0}
        id="tabpanel-0"
        aria-labelledby="tab-0">
        {activeTab === 0 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}>
              <Typography variant="h6">Orders to Process</Typography>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={fetchPendingOrders}
                disabled={refreshing}>
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </Box>

            {refreshing ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 4,
                }}>
                <CircularProgress />
              </Box>
            ) : pendingOrders.length === 0 ? (
              <Box>
                <Typography variant="body1" sx={{ textAlign: "center", py: 2 }}>
                  No pending orders to process
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", py: 1, color: "text.secondary" }}>
                  This could mean one of the following:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    py: 0.5,
                    color: "text.secondary",
                  }}>
                  • There are no orders in "Pending" status
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    py: 0.5,
                    color: "text.secondary",
                  }}>
                  • Your account doesn't have permission to view orders
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    py: 0.5,
                    color: "text.secondary",
                  }}>
                  • There was an issue with the API connection
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button variant="outlined" onClick={fetchPendingOrders}>
                    Try Again
                  </Button>
                </Box>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="pending orders table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell component="th" scope="row">
                          {order.order_id || order._id}
                        </TableCell>
                        <TableCell>
                          {order.customer?.name ||
                            order.customerName ||
                            "Customer"}
                        </TableCell>
                        <TableCell>{order.items?.length || 0} items</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color="primary"
                            size="small"
                            icon={<PendingIcon />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenOrderDialog(order)}
                            startIcon={<PreparedIcon />}
                            disabled={loading}>
                            Mark Prepared
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </div>

      {/* Ready for Pickup Orders Tab */}
      <div
        role="tabpanel"
        hidden={activeTab !== 1}
        id="tabpanel-1"
        aria-labelledby="tab-1">
        {activeTab === 1 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}>
              <Typography variant="h6">Orders Ready for Pickup</Typography>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={fetchReadyOrders}
                disabled={refreshing}>
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </Box>

            {refreshing ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 4,
                }}>
                <CircularProgress />
              </Box>
            ) : readyOrders.length === 0 ? (
              <Box>
                <Typography variant="body1" sx={{ textAlign: "center", py: 2 }}>
                  No orders ready for pickup
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", py: 1, color: "text.secondary" }}>
                  This could mean one of the following:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    py: 0.5,
                    color: "text.secondary",
                  }}>
                  • There are no orders in "Ready for Pickup" status
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    py: 0.5,
                    color: "text.secondary",
                  }}>
                  • All prepared orders have been picked up
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button variant="outlined" onClick={fetchReadyOrders}>
                    Try Again
                  </Button>
                </Box>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="ready orders table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {readyOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell component="th" scope="row">
                          {order.order_id || order._id}
                        </TableCell>
                        <TableCell>
                          {order.customer?.name ||
                            order.customerName ||
                            "Customer"}
                        </TableCell>
                        <TableCell>{order.items?.length || 0} items</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color="success"
                            size="small"
                            icon={<PreparedIcon />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenStatusDialog(order)}
                            startIcon={<ArrowBackIcon />}
                            color="warning"
                            disabled={loading}
                            sx={{ mr: 1 }}>
                            Change Status
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </div>

      {/* Inventory Tab */}
      <div
        role="tabpanel"
        hidden={activeTab !== 2}
        id="tabpanel-2"
        aria-labelledby="tab-2">
        {activeTab === 2 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}>
              <Typography variant="h6">Warehouse Inventory</Typography>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={fetchInventory}
                disabled={refreshing}>
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </Box>

            {refreshing ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 4,
                }}>
                <CircularProgress />
              </Box>
            ) : inventory.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: "center", py: 4 }}>
                No warehouse data found
              </Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="warehouse table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Warehouse ID</TableCell>
                      <TableCell>Warehouse Code</TableCell>
                      <TableCell>Street Address</TableCell>
                      <TableCell>Province</TableCell>
                      <TableCell>Country</TableCell>
                      <TableCell>Zip Code</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventory.map((warehouse) => (
                      <TableRow key={warehouse._id}>
                        <TableCell component="th" scope="row">
                          {warehouse._id}
                        </TableCell>
                        <TableCell>{warehouse.warehouseCode}</TableCell>
                        <TableCell>
                          {warehouse.address?.street || "N/A"}
                        </TableCell>
                        <TableCell>
                          {warehouse.address?.province || "N/A"}
                        </TableCell>
                        <TableCell>
                          {warehouse.address?.country || "N/A"}
                        </TableCell>
                        <TableCell>
                          {warehouse.address?.zipCode || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </div>

      {/* Order Dialog */}
      <Dialog
        open={orderDialog.open}
        onClose={handleCloseOrderDialog}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Process Order</DialogTitle>
        <DialogContent>
          {orderDialog.order && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Order #{orderDialog.order.order_id || orderDialog.order._id}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Customer:{" "}
                {orderDialog.order.customer?.name ||
                  orderDialog.order.customerName ||
                  "Customer"}
              </Typography>

              <Typography variant="body2" gutterBottom>
                Items:
              </Typography>

              <Box sx={{ ml: 2, mb: 2 }}>
                {orderDialog.order.items?.map((item, index) => (
                  <Typography key={index} variant="body2">
                    • {item.quantity}x{" "}
                    {item.product?.name || item.name || "Product"}
                  </Typography>
                ))}
              </Box>

              <TextField
                label="Processing Notes"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                value={orderDialog.notes}
                onChange={(e) =>
                  setOrderDialog({ ...orderDialog, notes: e.target.value })
                }
                sx={{ mb: 2, mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDialog}>Cancel</Button>
          <Button
            onClick={() => markOrderAsPrepared(orderDialog.order?._id)}
            variant="contained"
            color="primary"
            disabled={loading}>
            {loading ? "Processing..." : "Mark as Prepared"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Change Order Status</DialogTitle>
        <DialogContent>
          {statusDialog.order && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Order #{statusDialog.order.order_id || statusDialog.order._id}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Status:{" "}
                <Chip
                  label={statusDialog.order.status}
                  color="success"
                  size="small"
                />
              </Typography>

              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel id="status-select-label">New Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  value={statusDialog.status}
                  label="New Status"
                  onChange={(e) =>
                    setStatusDialog({ ...statusDialog, status: e.target.value })
                  }>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Status Change Notes"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                value={statusDialog.notes}
                onChange={(e) =>
                  setStatusDialog({ ...statusDialog, notes: e.target.value })
                }
                sx={{ mb: 2, mt: 2 }}
                placeholder="Explain why the status is being changed"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button
            onClick={() =>
              updateOrderStatus(statusDialog.order?._id, statusDialog.status)
            }
            variant="contained"
            color={statusDialog.status === "Cancelled" ? "error" : "warning"}
            disabled={loading}>
            {loading ? "Updating..." : `Change to ${statusDialog.status}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WarehouseDashboard;

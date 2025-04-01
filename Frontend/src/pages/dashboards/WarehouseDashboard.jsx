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

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        "http://localhost:3000/api/orders?status=Processing",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching pending orders: ${response.status}`);
      }

      const data = await response.json();
      setPendingOrders(data.data || []);
    } catch (error) {
      console.error("Failed to fetch pending orders:", error);
      setSnackbar({
        open: true,
        message: `Failed to fetch pending orders: ${error.message}`,
        severity: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("http://localhost:3000/api/warehouse", {
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
      const response = await fetch(
        `http://localhost:3000/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Ready for Pickup",
            notes: orderDialog.notes || "Order prepared by warehouse staff",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Error updating order: ${response.status}`
        );
      }

      await response.json();

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
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => navigate("/profile")}>
            Profile
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}>
            Logout
          </Button>
        </Box>
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
                Inventory Items
              </Typography>
              <Typography variant="h3">{inventory.length || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total items in warehouse
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h3">
                {inventory.filter((item) => item.quantity < 10).length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Items with quantity less than 10
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
            icon={<OrdersIcon />}
            label="PENDING ORDERS"
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab
            icon={<InventoryIcon />}
            label="INVENTORY"
            id="tab-1"
            aria-controls="tabpanel-1"
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
              <Typography variant="body1" sx={{ textAlign: "center", py: 4 }}>
                No pending orders to process
              </Typography>
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
                          {order.customer?.name || "Customer"}
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

      {/* Inventory Tab */}
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
                No inventory items found
              </Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="inventory table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell component="th" scope="row">
                          {item.item_id || item._id}
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {item.location || "Main Warehouse"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              item.quantity > 10
                                ? "In Stock"
                                : item.quantity > 0
                                ? "Low Stock"
                                : "Out of Stock"
                            }
                            color={
                              item.quantity > 10
                                ? "success"
                                : item.quantity > 0
                                ? "warning"
                                : "error"
                            }
                            size="small"
                          />
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
                Customer: {orderDialog.order.customer?.name || "Customer"}
              </Typography>

              <Typography variant="body2" gutterBottom>
                Items:
              </Typography>

              <Box sx={{ ml: 2, mb: 2 }}>
                {orderDialog.order.items?.map((item, index) => (
                  <Typography key={index} variant="body2">
                    • {item.quantity}x {item.product?.name || "Product"}
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

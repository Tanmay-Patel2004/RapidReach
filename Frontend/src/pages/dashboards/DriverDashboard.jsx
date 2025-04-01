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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  LocalShipping as ShippingIcon,
  ListAlt as OrdersIcon,
  CheckCircle as DeliveredIcon,
  Cancel as NotDeliveredIcon,
  AccessTime as PendingIcon,
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAuthToken,
  logout,
  selectUser,
} from "../../store/slices/authSlice";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const user = useSelector(selectUser);

  const [activeTab, setActiveTab] = useState(0);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [deliveryDialog, setDeliveryDialog] = useState({
    open: false,
    order: null,
    status: "Delivered",
    notes: "",
  });

  // Fetch available orders
  const fetchAvailableOrders = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        "http://localhost:3000/api/drivers/available-orders",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching available orders: ${response.status}`);
      }

      const data = await response.json();
      setAvailableOrders(data.data || []);
    } catch (error) {
      console.error("Failed to fetch available orders:", error);
      setSnackbar({
        open: true,
        message: `Failed to fetch available orders: ${error.message}`,
        severity: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch my orders
  const fetchMyOrders = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        "http://localhost:3000/api/drivers/my-orders",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching my orders: ${response.status}`);
      }

      const data = await response.json();
      setMyOrders(data.data || []);
    } catch (error) {
      console.error("Failed to fetch my orders:", error);
      setSnackbar({
        open: true,
        message: `Failed to fetch my orders: ${error.message}`,
        severity: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Claim an order
  const claimOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/drivers/claim-order/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Error claiming order: ${response.status}`
        );
      }

      const data = await response.json();

      // Update lists
      await fetchAvailableOrders();
      await fetchMyOrders();

      setSnackbar({
        open: true,
        message: "Order claimed successfully! You can now deliver it.",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to claim order:", error);
      setSnackbar({
        open: true,
        message: `Failed to claim order: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update delivery status
  const updateDeliveryStatus = async () => {
    try {
      setLoading(true);
      const { order, status, notes } = deliveryDialog;

      const response = await fetch(
        `http://localhost:3000/api/drivers/update-delivery/${order._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deliveryStatus: status,
            notes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error updating delivery status: ${response.status}`
        );
      }

      const data = await response.json();

      // Close dialog and update lists
      setDeliveryDialog({
        open: false,
        order: null,
        status: "Delivered",
        notes: "",
      });
      await fetchMyOrders();

      setSnackbar({
        open: true,
        message: `Order marked as ${status} successfully!`,
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update delivery status:", error);
      setSnackbar({
        open: true,
        message: `Failed to update delivery status: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Effect to load data when tab changes
  useEffect(() => {
    if (token) {
      if (activeTab === 0) {
        fetchAvailableOrders();
      } else {
        fetchMyOrders();
      }
    }
  }, [token, activeTab]);

  // Setup periodic refresh for available orders tab (every 30 seconds)
  useEffect(() => {
    let intervalId;

    if (token && activeTab === 0) {
      intervalId = setInterval(() => {
        fetchAvailableOrders();
      }, 30000); // 30 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [token, activeTab]);

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "No address provided";
    return `${address.street || ""} ${address.unitNumber || ""}, ${
      address.province || ""
    }, ${address.country || ""} ${address.zipCode || ""}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        padding: { xs: 2, sm: 3 },
        backgroundColor: "#f5f5f5",
        minHeight: "calc(100vh - 64px)",
      }}>
      {/* Header */}
      <Box
        sx={{
          display: "stretch",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          width: "100%",
        }}>
        <Typography variant="h4">Driver Dashboard</Typography>
      </Box>

      {/* Welcome Message */}
      <Box sx={{ mb: 4, width: "100%" }}>
        <Typography variant="h5" gutterBottom>
          Welcome, {user?.name || "Driver"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You can view and manage your deliveries here.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ width: "100%", mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "primary.main",
                height: 3,
              },
            }}>
            <Tab
              label="Available Orders"
              icon={<OrdersIcon />}
              iconPosition="start"
              sx={{
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
              }}
            />
            <Tab
              label="My Deliveries"
              icon={<ShippingIcon />}
              iconPosition="start"
              sx={{
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
              }}
            />
          </Tabs>
        </Box>

        {/* Refresh Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            onClick={() =>
              activeTab === 0 ? fetchAvailableOrders() : fetchMyOrders()
            }
            disabled={refreshing}
            startIcon={refreshing ? <CircularProgress size={20} /> : null}
            sx={{ borderRadius: 2 }}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </Box>

        {/* Available Orders Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {availableOrders.length === 0 ? (
              <Grid item xs={12}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: 3,
                    py: 4,
                  }}>
                  <CardContent>
                    <Typography
                      align="center"
                      variant="h6"
                      color="text.secondary">
                      No orders available for pickup
                    </Typography>
                    <Typography
                      align="center"
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}>
                      Check back later or refresh to see new orders
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              availableOrders.map((order) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={order._id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      boxShadow: 3,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box
                        sx={{
                          backgroundColor: "primary.light",
                          color: "primary.contrastText",
                          borderRadius: 1.5,
                          p: 1.5,
                          mb: 2,
                        }}>
                        <Typography variant="h6" fontWeight="bold">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Customer:</strong>{" "}
                        {order.customerName || "No name provided"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom>
                        <strong>Placed:</strong> {formatDate(order.createdAt)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom>
                        <strong>Items:</strong> {order.items?.length || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom>
                        <strong>Total:</strong> $
                        {order.totalAmount?.toFixed(2) || "0.00"}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        fontWeight="bold">
                        Delivery Address:
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph>
                        {formatAddress(order.address) || "No address provided"}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 3, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        color="primary"
                        onClick={() => claimOrder(order._id)}
                        disabled={loading}
                        startIcon={
                          loading ? <CircularProgress size={20} /> : null
                        }
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                        }}>
                        {loading ? "Claiming..." : "Claim Order"}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {/* My Deliveries Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {myOrders.length === 0 ? (
              <Grid item xs={12}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: 3,
                    py: 4,
                  }}>
                  <CardContent>
                    <Typography
                      align="center"
                      variant="h6"
                      color="text.secondary">
                      You haven't claimed any orders yet
                    </Typography>
                    <Typography
                      align="center"
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}>
                      Go to the "Available Orders" tab to claim an order
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              myOrders.map((order) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={order._id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      boxShadow: 3,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                      backgroundColor:
                        order.status === "Out for Delivery"
                          ? "rgba(3, 169, 244, 0.05)"
                          : order.status === "In Transit"
                          ? "rgba(255, 235, 59, 0.05)"
                          : order.status === "Delivered"
                          ? "rgba(76, 175, 80, 0.05)"
                          : order.status === "Failed Delivery"
                          ? "rgba(244, 67, 54, 0.05)"
                          : "inherit",
                      borderLeft:
                        order.status === "Out for Delivery"
                          ? "4px solid #03a9f4"
                          : order.status === "In Transit"
                          ? "4px solid #ffc107"
                          : order.status === "Delivered"
                          ? "4px solid #4caf50"
                          : order.status === "Failed Delivery"
                          ? "4px solid #f44336"
                          : "none",
                    }}>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                        }}>
                        <Typography variant="h6" fontWeight="bold">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor:
                              order.status === "Out for Delivery"
                                ? "info.light"
                                : order.status === "In Transit"
                                ? "warning.light"
                                : order.status === "Delivered"
                                ? "success.light"
                                : order.status === "Failed Delivery"
                                ? "error.light"
                                : "inherit",
                            borderRadius: 4,
                            px: 1.5,
                            py: 0.75,
                          }}>
                          {order.status === "Out for Delivery" && (
                            <LocalShippingIcon
                              fontSize="small"
                              sx={{ mr: 0.5 }}
                            />
                          )}
                          {order.status === "In Transit" && (
                            <PendingIcon fontSize="small" sx={{ mr: 0.5 }} />
                          )}
                          {order.status === "Delivered" && (
                            <DeliveredIcon fontSize="small" sx={{ mr: 0.5 }} />
                          )}
                          {order.status === "Failed Delivery" && (
                            <NotDeliveredIcon
                              fontSize="small"
                              sx={{ mr: 0.5 }}
                            />
                          )}
                          <Typography variant="caption" fontWeight="bold">
                            {order.status}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Customer:</strong>{" "}
                        {order.customerName || "No name provided"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom>
                        <strong>Placed:</strong> {formatDate(order.createdAt)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom>
                        <strong>Items:</strong> {order.items?.length || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom>
                        <strong>Total:</strong> $
                        {order.totalAmount?.toFixed(2) || "0.00"}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        fontWeight="bold">
                        Delivery Address:
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph>
                        {formatAddress(order.address) || "No address provided"}
                      </Typography>

                      {order.assignedDrivers?.[0]?.notes && (
                        <>
                          <Typography
                            variant="subtitle2"
                            gutterBottom
                            fontWeight="bold">
                            Delivery Notes:
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            paragraph>
                            {order.assignedDrivers[0].notes}
                          </Typography>
                        </>
                      )}
                    </CardContent>

                    {/* Only show update button for in-transit and out for delivery orders */}
                    {(order.status === "In Transit" ||
                      order.status === "Out for Delivery") && (
                      <Box sx={{ p: 3, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          color="primary"
                          onClick={() =>
                            setDeliveryDialog({
                              open: true,
                              order,
                              status: "Delivered",
                              notes: "",
                            })
                          }
                          sx={{
                            borderRadius: 2,
                            py: 1.5,
                          }}>
                          Update Delivery Status
                        </Button>
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>

      {/* Delivery Status Update Dialog */}
      <Dialog
        open={deliveryDialog.open}
        onClose={() => setDeliveryDialog({ ...deliveryDialog, open: false })}
        maxWidth="sm"
        fullWidth>
        <DialogTitle sx={{ fontSize: "1.5rem", pb: 1, pt: 3 }}>
          Update Delivery Status
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2 }}>
          <Box sx={{ minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>
              Order #{deliveryDialog.order?._id.slice(-6).toUpperCase()}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Customer:{" "}
              {deliveryDialog.order?.customerName || "No name provided"}
            </Typography>

            <FormControl fullWidth sx={{ mt: 3, mb: 3 }}>
              <InputLabel>Delivery Status</InputLabel>
              <Select
                value={deliveryDialog.status}
                label="Delivery Status"
                onChange={(e) =>
                  setDeliveryDialog({
                    ...deliveryDialog,
                    status: e.target.value,
                  })
                }>
                <MenuItem value="Out for Delivery">Out for Delivery</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Not Delivered">Not Delivered</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Delivery Notes"
              multiline
              rows={4}
              fullWidth
              value={deliveryDialog.notes}
              onChange={(e) =>
                setDeliveryDialog({ ...deliveryDialog, notes: e.target.value })
              }
              placeholder={
                deliveryDialog.status === "Not Delivered"
                  ? "Please provide a reason for non-delivery"
                  : "Any additional notes about the delivery (optional)"
              }
              helperText={
                deliveryDialog.status === "Not Delivered"
                  ? "Reason for non-delivery is required"
                  : ""
              }
              required={deliveryDialog.status === "Not Delivered"}
              error={
                deliveryDialog.status === "Not Delivered" &&
                !deliveryDialog.notes
              }
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() =>
              setDeliveryDialog({ ...deliveryDialog, open: false })
            }
            sx={{ borderRadius: 2, px: 3 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={updateDeliveryStatus}
            disabled={
              loading ||
              (deliveryDialog.status === "Not Delivered" &&
                !deliveryDialog.notes)
            }
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ borderRadius: 2, px: 3 }}>
            {loading ? "Updating..." : "Update Status"}
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
          sx={{ width: "100%" }}
          variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DriverDashboard;

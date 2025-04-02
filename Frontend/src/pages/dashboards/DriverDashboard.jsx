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
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  LocalShipping as ShippingIcon,
  ListAlt as OrdersIcon,
  CheckCircle,
  Cancel,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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

  // Improved date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    // Return a more compact date format
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleDateString(undefined, options);
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
          width: "100vh",
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
      <Box sx={{ width: "100%", mb: 4 }}>
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            mb: 3,
          }}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(66, 66, 66, 0.2)"
                  : "rgba(25, 118, 210, 0.05)",
            }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                "& .MuiTab-root": {
                  py: isMobile ? 1.5 : 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(25, 118, 210, 0.05)",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "primary.main",
                  height: 3,
                },
              }}>
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <OrdersIcon fontSize={isMobile ? "small" : "medium"} />
                    <Typography
                      variant={isMobile ? "body2" : "button"}
                      sx={{ fontWeight: activeTab === 0 ? "bold" : "medium" }}>
                      Available Orders
                    </Typography>
                  </Box>
                }
                sx={{
                  fontSize: "1rem",
                  textTransform: "none",
                }}
              />
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ShippingIcon fontSize={isMobile ? "small" : "medium"} />
                    <Typography
                      variant={isMobile ? "body2" : "button"}
                      sx={{ fontWeight: activeTab === 1 ? "bold" : "medium" }}>
                      My Deliveries
                    </Typography>
                  </Box>
                }
                sx={{
                  fontSize: "1rem",
                  textTransform: "none",
                }}
              />
            </Tabs>
          </Box>
        </Card>

        {/* Refresh Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            onClick={() =>
              activeTab === 0 ? fetchAvailableOrders() : fetchMyOrders()
            }
            disabled={refreshing}
            startIcon={refreshing ? <CircularProgress size={20} /> : null}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: 2,
            }}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </Box>

        {/* Available Orders Tab */}
        <Box
          sx={{
            display: activeTab === 0 ? "block" : "none",
            width: "100%",
          }}>
          {refreshing ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}>
              <CircularProgress />
            </Box>
          ) : availableOrders.length === 0 ? (
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(25, 118, 210, 0.05)",
                border: "1px dashed",
                borderColor: "divider",
              }}>
              <OrdersIcon
                sx={{
                  fontSize: 60,
                  color: "text.secondary",
                  opacity: 0.5,
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No Available Orders
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no orders available for delivery at this moment.
              </Typography>
              <Button
                variant="outlined"
                onClick={fetchAvailableOrders}
                sx={{ mt: 2 }}>
                Check Again
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {availableOrders.map((order) => (
                <Grid item xs={12} sm={6} md={4} key={order._id}>
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
                      position: "relative",
                      overflow: "visible",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "4px",
                        backgroundColor: "primary.main",
                        borderRadius: "2px 2px 0 0",
                      },
                    }}>
                    <CardContent sx={{ p: 0 }}>
                      {/* Header */}
                      <Box
                        sx={{
                          backgroundColor: (theme) =>
                            theme.palette.mode === "dark"
                              ? "primary.dark"
                              : "primary.main",
                          color: "primary.contrastText",
                          borderRadius: "2px 2px 0 0",
                          p: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ display: "flex", alignItems: "center" }}>
                          <OrdersIcon sx={{ mr: 1, fontSize: 20 }} />#
                          {order._id.slice(-6).toUpperCase()}
                        </Typography>
                        <Chip
                          label="New"
                          size="small"
                          sx={{
                            backgroundColor: "white",
                            color: "primary.main",
                            fontWeight: "bold",
                          }}
                        />
                      </Box>

                      {/* Content */}
                      <Box sx={{ p: 3 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}>
                            Customer
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "medium" }}>
                            {order.customerName || "Not specified"}
                          </Typography>
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}>
                              Placed
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(order.createdAt)}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}>
                              Items
                            </Typography>
                            <Typography variant="body1">
                              {order.items?.length || 0}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}>
                            Total Amount
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ color: "primary.main", fontWeight: "bold" }}>
                            ${order.totalAmount?.toFixed(2) || "0.00"}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}>
                            Delivery Address
                          </Typography>
                          <Typography variant="body1">
                            {formatAddress(order.address) ||
                              "No address provided"}
                          </Typography>
                        </Box>

                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          onClick={() => claimOrder(order._id)}
                          disabled={loading}
                          sx={{
                            mt: 2,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: "bold",
                            boxShadow: 2,
                            "&:hover": {
                              boxShadow: 4,
                            },
                          }}>
                          {loading ? (
                            <>
                              <CircularProgress size={24} sx={{ mr: 1 }} />{" "}
                              Claiming...
                            </>
                          ) : (
                            "Claim Order"
                          )}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* My Deliveries Tab */}
        <Box
          sx={{
            display: activeTab === 1 ? "block" : "none",
            width: "100%",
          }}>
          {refreshing ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}>
              <CircularProgress />
            </Box>
          ) : myOrders.length === 0 ? (
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(25, 118, 210, 0.05)",
                border: "1px dashed",
                borderColor: "divider",
              }}>
              <ShippingIcon
                sx={{
                  fontSize: 60,
                  color: "text.secondary",
                  opacity: 0.5,
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No Deliveries Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You haven't claimed any orders for delivery yet.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setActiveTab(0)}
                sx={{ mt: 2 }}>
                Browse Available Orders
              </Button>
            </Card>
          ) : (
            <Grid container spacing={isMobile ? 2 : 3}>
              {myOrders.map((order) => {
                // Get the active driver assignment for this order
                const driverAssignment = order.assignedDrivers?.find(
                  (driver) => driver.driverId === user?._id
                );
                const deliveryStatus =
                  driverAssignment?.deliveryStatus || "Pending";

                // Define status color
                const getStatusInfo = (status) => {
                  switch (status) {
                    case "Delivered":
                      return {
                        color: "#4caf50",
                        borderColor: "#4caf50",
                        bgColor: "#e8f5e9",
                        icon: <CheckCircle sx={{ fontSize: 16, mr: 0.5 }} />,
                        text: "Delivered",
                      };
                    case "Not Delivered":
                      return {
                        color: "#f44336",
                        borderColor: "#f44336",
                        bgColor: "#ffebee",
                        icon: <Cancel sx={{ fontSize: 16, mr: 0.5 }} />,
                        text: "Not Delivered",
                      };
                    case "In Transit":
                      return {
                        color: "#ff9800",
                        borderColor: "#ff9800",
                        bgColor: "#fff8e1",
                        icon: (
                          <LocalShippingIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        ),
                        text: "In Transit",
                      };
                    case "Out for Delivery":
                      return {
                        color: "#2196f3",
                        borderColor: "#2196f3",
                        bgColor: "#e3f2fd",
                        icon: (
                          <LocalShippingIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        ),
                        text: "Out for Delivery",
                      };
                    default:
                      return {
                        color: "#9e9e9e",
                        borderColor: "#9e9e9e",
                        bgColor: "#f5f5f5",
                        icon: <PendingIcon sx={{ fontSize: 16, mr: 0.5 }} />,
                        text: "Pending",
                      };
                  }
                };

                const statusInfo = getStatusInfo(deliveryStatus);

                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={isTablet ? 6 : 4}
                    lg={isTablet ? 4 : 3}
                    key={order._id}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: 2,
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 4,
                        },
                        border: `1px solid ${statusInfo.borderColor}`,
                        borderLeft: `6px solid ${statusInfo.borderColor}`,
                      }}>
                      {/* Header with Order ID and Status */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: statusInfo.bgColor,
                          p: 1.5,
                          borderBottom: `1px solid ${statusInfo.borderColor}`,
                        }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <OrdersIcon
                            sx={{
                              color: statusInfo.color,
                              mr: 1,
                              fontSize: 20,
                            }}
                          />
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            color="text.primary">
                            #{order._id.slice(-6).toUpperCase()}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            color: statusInfo.color,
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                          }}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </Box>
                      </Box>

                      {/* Content */}
                      <Box sx={{ p: 2 }}>
                        {/* Customer */}
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom>
                            Customer
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {order.customerName || "No name provided"}
                          </Typography>
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 1.5 }}>
                          {/* Placed */}
                          <Grid item xs={6}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom>
                              Placed
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(order.createdAt)}
                            </Typography>
                          </Grid>

                          {/* Items */}
                          <Grid item xs={6}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom>
                              Items
                            </Typography>
                            <Typography variant="body2">
                              {order.items?.length || 0}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* Total Amount */}
                        <Box sx={{ mb: 1.5 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom>
                            Total Amount
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            ${order.totalAmount?.toFixed(2) || "0.00"}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        {/* Delivery Address */}
                        <Box sx={{ mb: 1.5 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom>
                            Delivery Address
                          </Typography>
                          <Typography variant="body2">
                            {formatAddress(order.address) ||
                              "No address provided"}
                          </Typography>
                        </Box>

                        {/* Delivery Notes */}
                        {driverAssignment?.notes && (
                          <Box
                            sx={{
                              mt: 1.5,
                              p: 1.5,
                              backgroundColor: statusInfo.bgColor,
                              borderRadius: 1,
                              borderLeft: `3px solid ${statusInfo.borderColor}`,
                            }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom>
                              Delivery Notes
                            </Typography>
                            <Typography variant="body2">
                              {driverAssignment.notes}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Update Button */}
                      {(deliveryStatus === "In Transit" ||
                        deliveryStatus === "Out for Delivery") && (
                        <Box sx={{ p: 2, pt: 0, mt: "auto" }}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() =>
                              setDeliveryDialog({
                                open: true,
                                order,
                                status: "Delivered",
                                notes: "",
                              })
                            }
                            sx={{
                              py: 1,
                              borderRadius: 1.5,
                              textTransform: "none",
                              backgroundColor: statusInfo.color,
                              "&:hover": {
                                backgroundColor: statusInfo.color,
                                filter: "brightness(0.9)",
                              },
                            }}>
                            Update Status
                          </Button>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
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

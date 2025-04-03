import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  LocalShipping,
  Favorite,
  ShoppingCart,
  Star,
  LocalOffer,
  Timeline,
  NavigateNext,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser, selectAuthToken } from "../../store/slices/authSlice";
import logger from "../../utils/logger";

const CustomerDashboard = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectAuthToken);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("User in dashboard:", user); // Add this to debug

  // Fetch recent orders for the customer
  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3000/api/orders/customer",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const result = await response.json();

        // Extract orders from the response
        let orders = [];
        if (Array.isArray(result)) {
          orders = result;
        } else if (result.data && Array.isArray(result.data)) {
          orders = result.data;
        } else if (result.code === 200 && result.data) {
          orders = Array.isArray(result.data.orders)
            ? result.data.orders
            : result.data;
        }

        // Sort by date and take the most recent 3
        const sortedOrders = orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentOrders(sortedOrders.slice(0, 3));
      } catch (err) {
        console.error("Error fetching customer orders:", err);
        logger.error("Error fetching customer orders", { error: err.message });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCustomerOrders();
    }
  }, [token]);

  // Static data for demonstration (only used for favorite products)
  const favoriteProducts = [
    {
      name: "MacBook Pro",
      price: 1999.99,
      rating: 4.8,
      image: "https://via.placeholder.com/50",
    },
    {
      name: "iPhone 15 Pro",
      price: 999.99,
      rating: 4.9,
      image: "https://via.placeholder.com/50",
    },
    {
      name: "AirPods Pro",
      price: 249.99,
      rating: 4.7,
      image: "https://via.placeholder.com/50",
    },
  ];

  const recentActivities = [
    {
      action: "Added item to cart",
      item: "Dell XPS 13",
      time: "2 hours ago",
    },
    {
      action: "Reviewed product",
      item: "Gaming Mouse",
      time: "5 hours ago",
    },
    {
      action: "Saved to wishlist",
      item: "Mechanical Keyboard",
      time: "1 day ago",
    },
  ];

  // Format date in a readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get appropriate color based on order status
  const getStatusColor = (status) => {
    if (!status) return "default";

    const statusLower = status.toLowerCase();
    if (statusLower.includes("deliver")) return "success";
    if (statusLower.includes("transit") || statusLower.includes("pickup"))
      return "primary";
    if (statusLower.includes("process")) return "info";
    if (statusLower.includes("pend")) return "warning";
    if (statusLower.includes("cancel") || statusLower.includes("fail"))
      return "error";
    return "default";
  };

  return (
    <Box sx={{ py: 4, backgroundColor: "background.default" }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
          Welcome back, {user?.name || "Guest"}! 👋
        </Typography>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "primary.light",
                color: "primary.contrastText",
              }}>
              <ShoppingCart sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ mb: 1 }}>
                12
              </Typography>
              <Typography variant="subtitle2">Total Orders</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "success.light",
                color: "success.contrastText",
              }}>
              <LocalShipping sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ mb: 1 }}>
                2
              </Typography>
              <Typography variant="subtitle2">Active Shipments</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "warning.light",
                color: "warning.contrastText",
              }}>
              <Favorite sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ mb: 1 }}>
                8
              </Typography>
              <Typography variant="subtitle2">Wishlist Items</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "error.light",
                color: "error.contrastText",
              }}>
              <LocalOffer sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ mb: 1 }}>
                5
              </Typography>
              <Typography variant="subtitle2">Available Offers</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Orders
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => (window.location.href = "/orders")}>
                    <NavigateNext />
                  </IconButton>
                </Box>

                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : recentOrders.length > 0 ? (
                  <List>
                    {recentOrders.map((order, index) => (
                      <React.Fragment key={order._id}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar
                              variant="rounded"
                              sx={{
                                backgroundColor: (theme) =>
                                  theme.palette.grey[100],
                              }}>
                              <ShoppingCart color="primary" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}>
                                <Typography variant="subtitle1">
                                  {order.items && order.items.length > 0
                                    ? `${order.items.length} ${
                                        order.items.length === 1
                                          ? "item"
                                          : "items"
                                      }`
                                    : "Order"}
                                </Typography>
                                <Typography variant="subtitle1" color="primary">
                                  ${order.totalAmount?.toFixed(2) || "0.00"}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mt: 1,
                                }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary">
                                  Order ID: {order._id.substring(0, 8)}...
                                  <br />
                                  {formatDate(order.createdAt)}
                                </Typography>
                                <Chip
                                  label={order.status || "N/A"}
                                  size="small"
                                  color={getStatusColor(order.status)}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentOrders.length - 1 && (
                          <Divider variant="inset" component="li" />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <ShoppingCart
                      sx={{ fontSize: 40, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      No orders found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}>
                      When you place an order, it will appear here
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Favorite Products */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}>
                <Typography variant="h6">Favorite Products</Typography>
                <IconButton size="small">
                  <NavigateNext />
                </IconButton>
              </Box>
              <List>
                {favoriteProducts.map((product, index) => (
                  <React.Fragment key={product.name}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={product.image} variant="rounded" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}>
                            <Typography variant="subtitle1">
                              {product.name}
                            </Typography>
                            <Typography variant="subtitle1" color="primary">
                              ${product.price}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 1,
                            }}>
                            <Star
                              sx={{
                                color: "warning.main",
                                fontSize: 16,
                                mr: 0.5,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {product.rating}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < favoriteProducts.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}>
                <Typography variant="h6">Recent Activities</Typography>
                <IconButton size="small">
                  <Timeline />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                {recentActivities.map((activity, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          {activity.time}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {activity.action}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          color="primary"
                          sx={{ mt: 1 }}>
                          {activity.item}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CustomerDashboard;

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Collapse,
  Button,
  Tabs,
  Tab,
  Tooltip,
  Snackbar,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ShoppingBag as OrderIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  CheckCircle as DeliveredIcon,
  Pending as PendingIcon,
  Download as DownloadIcon,
  StoreOutlined as StoreIcon,
} from "@mui/icons-material";
import {
  selectAuthToken,
  selectUser,
  selectUserRole,
} from "../store/slices/authSlice";
import logger from "../utils/logger";
import { useTheme } from "@mui/material/styles";

const OrdersPage = () => {
  const token = useSelector(selectAuthToken);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const theme = useTheme();

  const sortOrdersByDate = (orders) => {
    return [...orders].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";

      // Try customer-specific endpoint first
      let response = await fetch(`${apiUrl}/orders/customer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If customer-specific endpoint fails, fall back to the main endpoint (for backwards compatibility)
      if (!response.ok) {
        console.warn(
          `Customer-specific endpoint failed with ${response.status}, falling back to main endpoint.`
        );

        response = await fetch(`${apiUrl}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch orders: ${response.status} ${response.statusText}`
          );
        }
      }

      const result = await response.json();

      // Handle different response formats from the API
      let orderData;
      if (Array.isArray(result)) {
        // API returns an array directly
        orderData = result;
      } else if (result.data && Array.isArray(result.data)) {
        // API returns {code, message, data} format where data is the array
        orderData = result.data;
      } else if (result.code === 200 && result.data) {
        // API returns {code, message, data} format where data might be in a nested property
        orderData = Array.isArray(result.data.orders)
          ? result.data.orders
          : result.data;
      } else {
        // Fallback
        orderData = [];
        console.warn("Unknown response format from API:", result);
      }

      const sortedOrders = sortOrdersByDate(orderData);
      setOrders(sortedOrders);
      filterOrders(sortedOrders, statusFilter);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
      logger.error("Error fetching orders", { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on status
  const filterOrders = (ordersToFilter, status) => {
    if (status === "all") {
      setFilteredOrders(ordersToFilter);
    } else {
      setFilteredOrders(
        ordersToFilter.filter(
          (order) => order.status.toLowerCase() === status.toLowerCase()
        )
      );
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setStatusFilter(newValue);
    filterOrders(orders, newValue);
  };

  useEffect(() => {
    console.log("OrdersPage: Fetching orders...");
    fetchOrders();
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <PendingIcon sx={{ color: theme.palette.warning.main }} />;
      case "ready for pickup":
        return <StoreIcon sx={{ color: theme.palette.info.main }} />;
      case "out for delivery":
        return <ShippingIcon sx={{ color: theme.palette.primary.main }} />;
      case "delivered":
        return <DeliveredIcon sx={{ color: theme.palette.success.main }} />;
      default:
        return <PendingIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "ready for pickup":
        return "info";
      case "out for delivery":
        return "primary";
      case "delivered":
        return "success";
      default:
        return "default";
    }
  };

  const isAdmin = () => {
    // Check if user has Super Admin role from either structure
    return (
      userRole?.name === "Super Admin" ||
      user?.role?.name === "Super Admin" ||
      user?.role_id?.name === "Super Admin"
    );
  };

  // Download receipt function
  const downloadReceipt = async (order) => {
    try {
      // Dynamically import jsPDF and jspdf-autotable
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();

      // Add header
      doc.setFontSize(20);
      doc.text("Order Receipt", 105, 15, { align: "center" });

      // Add order details
      doc.setFontSize(12);
      doc.text(`Order ID: #${order._id.slice(-8).toUpperCase()}`, 14, 30);
      doc.text(`Date: ${formatDate(order.createdAt)}`, 14, 37);
      doc.text(`Status: ${order.status}`, 14, 44);
      doc.text(`Customer: ${user?.name || "Customer"}`, 14, 51);

      // Add items table
      const tableColumn = ["Item", "Quantity", "Price", "Total"];
      const tableRows = [];

      order.items.forEach((item) => {
        const tableRow = [
          item.name,
          item.quantity,
          `$${item.price.toFixed(2)}`,
          `$${(item.price * item.quantity).toFixed(2)}`,
        ];
        tableRows.push(tableRow);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 58,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      // Add total after the table
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Amount: $${order.totalAmount.toFixed(2)}`, 150, finalY, {
        align: "right",
      });

      // Add footer
      doc.setFontSize(10);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} - RapidReach`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );

      // Save the PDF
      doc.save(`Receipt_Order_${order._id.slice(-8).toUpperCase()}.pdf`);

      setSnackbar({
        open: true,
        message: "Receipt downloaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error generating receipt:", error);
      setSnackbar({
        open: true,
        message: "Failed to download receipt: " + error.message,
        severity: "error",
      });
    }
  };

  const renderOrders = () => {
    if (filteredOrders.length === 0) {
      return (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <OrderIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Orders Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusFilter === "all"
              ? "You haven't placed any orders yet."
              : `You don't have any ${statusFilter} orders.`}
          </Typography>
        </Card>
      );
    }

    return (
      <>
        {filteredOrders.map((order, index) => (
          <Card key={order._id} sx={{ mb: 3 }}>
            {renderOrderCard(order, index === 0 && statusFilter === "all")}
          </Card>
        ))}
      </>
    );
  };

  const renderOrderCard = (order, isLatest = false) => (
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <Typography variant="subtitle2" color="text.secondary">
            Order ID
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            #{order._id.slice(-8).toUpperCase()}
            {isLatest && (
              <Chip
                label="Latest"
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant="subtitle2" color="text.secondary">
            Order Date
          </Typography>
          <Typography variant="body1">{formatDate(order.createdAt)}</Typography>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Total Amount
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            ${order.totalAmount.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getStatusIcon(order.status)}
            <Chip
              label={order.status}
              color={getStatusColor(order.status)}
              size="small"
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton
              onClick={() =>
                setExpandedOrder(expandedOrder === order._id ? null : order._id)
              }
              sx={{ mr: 1 }}>
              {expandedOrder === order._id ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </IconButton>
            <Tooltip title="Download Receipt">
              <IconButton
                onClick={() => downloadReceipt(order)}
                color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      <Collapse in={expandedOrder === order._id}>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <Card key={item._id} sx={{ mb: 2, bgcolor: "grey.50" }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        Price: ${item.price}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Total: ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No items found in this order.
            </Typography>
          )}
        </Box>
      </Collapse>
    </CardContent>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Order History
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Status filter tabs */}
      <Tabs
        value={statusFilter}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTabs-flexContainer": {
            gap: 1,
          },
          "& .MuiTab-root": {
            minWidth: "auto",
            borderRadius: "8px 8px 0 0",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.04)",
            },
          },
          "& .Mui-selected": {
            fontWeight: "bold",
          },
        }}
        TabIndicatorProps={{
          style: {
            backgroundColor: theme.palette.primary.main,
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        }}
        variant="scrollable"
        scrollButtons="auto">
        <Tab
          label="All Orders"
          value="all"
          sx={{
            fontWeight: statusFilter === "all" ? "bold" : "normal",
          }}
        />
        <Tab
          label="Pending"
          value="pending"
          icon={<PendingIcon />}
          iconPosition="start"
          sx={{
            color:
              statusFilter === "pending"
                ? theme.palette.warning.main
                : "inherit",
            fontWeight: statusFilter === "pending" ? "bold" : "normal",
            "&.Mui-selected": {
              backgroundColor: "rgba(237, 108, 2, 0.1)",
            },
          }}
        />
        <Tab
          label="Ready for Pickup"
          value="ready for pickup"
          icon={<StoreIcon />}
          iconPosition="start"
          sx={{
            color:
              statusFilter === "ready for pickup"
                ? theme.palette.info.main
                : "inherit",
            fontWeight: statusFilter === "ready for pickup" ? "bold" : "normal",
            "&.Mui-selected": {
              backgroundColor: "rgba(2, 136, 209, 0.1)",
            },
          }}
        />
        <Tab
          label="Out for Delivery"
          value="out for delivery"
          icon={<ShippingIcon />}
          iconPosition="start"
          sx={{
            color:
              statusFilter === "out for delivery"
                ? theme.palette.primary.main
                : "inherit",
            fontWeight: statusFilter === "out for delivery" ? "bold" : "normal",
            "&.Mui-selected": {
              backgroundColor: "rgba(25, 118, 210, 0.1)",
            },
          }}
        />
        <Tab
          label="Delivered"
          value="delivered"
          icon={<DeliveredIcon />}
          iconPosition="start"
          sx={{
            color:
              statusFilter === "delivered"
                ? theme.palette.success.main
                : "inherit",
            fontWeight: statusFilter === "delivered" ? "bold" : "normal",
            "&.Mui-selected": {
              backgroundColor: "rgba(76, 175, 80, 0.1)",
            },
          }}
        />
      </Tabs>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}>
          <CircularProgress />
        </Box>
      ) : (
        renderOrders()
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrdersPage;

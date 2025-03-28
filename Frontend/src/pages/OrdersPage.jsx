import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ShoppingBag as OrderIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  CheckCircle as DeliveredIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { selectAuthToken } from '../store/slices/authSlice';
import logger from '../utils/logger';
import { useTheme } from '@mui/material/styles';

const OrdersPage = () => {
  const token = useSelector(selectAuthToken);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
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

      const response = await fetch('http://localhost:3000/api/orders/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      setOrders(sortOrdersByDate(result));
    } catch (err) {
      setError(err.message);
      logger.error('Error fetching orders', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <PendingIcon sx={{ color: theme.palette.warning.main }} />;
      case 'processing':
        return <InventoryIcon sx={{ color: theme.palette.info.main }} />;
      case 'shipped':
        return <ShippingIcon sx={{ color: theme.palette.primary.main }} />;
      case 'delivered':
        return <DeliveredIcon sx={{ color: theme.palette.success.main }} />;
      default:
        return <PendingIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const renderOrders = () => {
    if (orders.length === 0) {
      return (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <OrderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Orders Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You haven't placed any orders yet.
          </Typography>
        </Card>
      );
    }

    return (
      <>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Latest Order
          </Typography>
          <Card sx={{ 
            borderLeft: 4, 
            borderColor: 'primary.main',
            boxShadow: (theme) => theme.shadows[3]
          }}>
            {renderOrderCard(orders[0], true)}
          </Card>
        </Box>

        {orders.length > 1 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Previous Orders
            </Typography>
            {orders.slice(1).map((order) => (
              <Card key={order._id} sx={{ mb: 3 }}>
                {renderOrderCard(order)}
              </Card>
            ))}
          </>
        )}
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
          <Typography variant="body1">
            {formatDate(order.createdAt)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant="subtitle2" color="text.secondary">
            Total Amount
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            ${order.totalAmount.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(order.status)}
            <Chip
              label={order.status}
              color={getStatusColor(order.status)}
              size="small"
            />
          </Box>
        </Grid>
      </Grid>

      <IconButton
        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
        sx={{ mt: 1 }}
      >
        {expandedOrder === order._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>

      <Collapse in={expandedOrder === order._id}>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <Card key={item._id} sx={{ mb: 2, bgcolor: 'grey.50' }}>
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        renderOrders()
      )}
    </Container>
  );
};

export default OrdersPage; 
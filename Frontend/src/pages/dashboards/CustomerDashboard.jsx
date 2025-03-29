import React from 'react';
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
} from '@mui/material';
import {
  LocalShipping,
  Favorite,
  ShoppingCart,
  Star,
  LocalOffer,
  Timeline,
  NavigateNext,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const CustomerDashboard = () => {
  const user = useSelector(selectUser);
  console.log('User in dashboard:', user); // Add this to debug

  // Static data for demonstration
  const recentOrders = [
    {
      id: 'ORD001',
      product: 'Gaming Laptop',
      date: '2024-03-10',
      status: 'Delivered',
      amount: 1299.99,
      image: 'https://via.placeholder.com/50',
    },
    {
      id: 'ORD002',
      product: 'Wireless Headphones',
      date: '2024-03-08',
      status: 'In Transit',
      amount: 199.99,
      image: 'https://via.placeholder.com/50',
    },
    {
      id: 'ORD003',
      product: 'Smartwatch',
      date: '2024-03-05',
      status: 'Processing',
      amount: 299.99,
      image: 'https://via.placeholder.com/50',
    },
  ];

  const favoriteProducts = [
    {
      name: 'MacBook Pro',
      price: 1999.99,
      rating: 4.8,
      image: 'https://via.placeholder.com/50',
    },
    {
      name: 'iPhone 15 Pro',
      price: 999.99,
      rating: 4.9,
      image: 'https://via.placeholder.com/50',
    },
    {
      name: 'AirPods Pro',
      price: 249.99,
      rating: 4.7,
      image: 'https://via.placeholder.com/50',
    },
  ];

  const recentActivities = [
    {
      action: 'Added item to cart',
      item: 'Dell XPS 13',
      time: '2 hours ago',
    },
    {
      action: 'Reviewed product',
      item: 'Gaming Mouse',
      time: '5 hours ago',
    },
    {
      action: 'Saved to wishlist',
      item: 'Mechanical Keyboard',
      time: '1 day ago',
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'in transit':
        return 'primary';
      case 'processing':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ py: 4, backgroundColor: 'background.default' }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Welcome back, {user?.name || 'Guest'}! 👋
        </Typography>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              }}
            >
              <ShoppingCart sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ mb: 1 }}>12</Typography>
              <Typography variant="subtitle2">Total Orders</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'success.light',
                color: 'success.contrastText',
              }}
            >
              <LocalShipping sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ mb: 1 }}>2</Typography>
              <Typography variant="subtitle2">Active Shipments</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
              }}
            >
              <Favorite sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ mb: 1 }}>8</Typography>
              <Typography variant="subtitle2">Wishlist Items</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'error.light',
                color: 'error.contrastText',
              }}
            >
              <LocalOffer sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ mb: 1 }}>5</Typography>
              <Typography variant="subtitle2">Available Offers</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Recent Orders</Typography>
                <IconButton size="small">
                  <NavigateNext />
                </IconButton>
              </Box>
              <List>
                {recentOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={order.image} variant="rounded" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">{order.product}</Typography>
                            <Typography variant="subtitle1" color="primary">
                              ${order.amount}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Order ID: {order.id}
                            </Typography>
                            <Chip
                              label={order.status}
                              size="small"
                              color={getStatusColor(order.status)}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentOrders.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Favorite Products */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">{product.name}</Typography>
                            <Typography variant="subtitle1" color="primary">
                              ${product.price}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Star sx={{ color: 'warning.main', fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {product.rating}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < favoriteProducts.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                        <Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>
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

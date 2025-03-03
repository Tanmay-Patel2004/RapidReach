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
  IconButton,
  Divider,
} from '@mui/material';
import {
  People,
  Inventory,
  LocalShipping,
  AttachMoney,
  TrendingUp,
  Warning,
  Person,
  NavigateNext,
  Notifications,
} from '@mui/icons-material';

const AdminDashboard = () => {
  // Static data for demonstration
  const revenueStats = {
    daily: 2500,
    weekly: 15000,
    monthly: 65000,
    growth: 12.5,
  };

  const systemStats = {
    totalUsers: 1250,
    activeUsers: 850,
    totalProducts: 450,
    lowStock: 25,
  };

  const recentUsers = [
    {
      name: 'Emma Wilson',
      email: 'emma.w@example.com',
      role: 'Customer',
      joinDate: '2024-03-10',
      avatar: 'https://via.placeholder.com/40',
    },
    {
      name: 'James Brown',
      email: 'james.b@example.com',
      role: 'Driver',
      joinDate: '2024-03-09',
      avatar: 'https://via.placeholder.com/40',
    },
    {
      name: 'Sarah Davis',
      email: 'sarah.d@example.com',
      role: 'Customer',
      joinDate: '2024-03-08',
      avatar: 'https://via.placeholder.com/40',
    },
  ];

  const alerts = [
    {
      type: 'warning',
      message: 'Low stock alert: 5 products below threshold',
      time: '2 hours ago',
    },
    {
      type: 'error',
      message: 'Failed delivery attempt: Order #45678',
      time: '4 hours ago',
    },
    {
      type: 'info',
      message: 'New user registration spike detected',
      time: '6 hours ago',
    },
  ];

  const stockAlerts = [
    {
      product: 'Gaming Laptop XPS',
      stock: 5,
      threshold: 10,
      status: 'critical',
    },
    {
      product: 'Wireless Earbuds Pro',
      stock: 8,
      threshold: 15,
      status: 'warning',
    },
    {
      product: '4K Monitor Ultra',
      stock: 12,
      threshold: 20,
      status: 'normal',
    },
  ];

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'normal':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ py: 4, backgroundColor: 'background.default' }}>
      <Container maxWidth="xl">
        {/* Welcome Section */}
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Admin Dashboard Overview 📊
        </Typography>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <People sx={{ fontSize: 40 }} />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4">{systemStats.totalUsers}</Typography>
                  <Typography variant="subtitle2">Total Users</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption">Active Users: {systemStats.activeUsers}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={(systemStats.activeUsers / systemStats.totalUsers) * 100}
                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'success.light',
                color: 'success.contrastText',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <AttachMoney sx={{ fontSize: 40 }} />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4">${revenueStats.daily.toLocaleString()}</Typography>
                  <Typography variant="subtitle2">Today's Revenue</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="caption">
                  {revenueStats.growth}% growth this week
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Inventory sx={{ fontSize: 40 }} />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4">{systemStats.totalProducts}</Typography>
                  <Typography variant="subtitle2">Total Products</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Warning sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="caption">
                  {systemStats.lowStock} products low in stock
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'error.light',
                color: 'error.contrastText',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <LocalShipping sx={{ fontSize: 40 }} />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4">28</Typography>
                  <Typography variant="subtitle2">Active Deliveries</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption">
                  15 completed today
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Recent Users */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Recent Users</Typography>
                <IconButton size="small">
                  <NavigateNext />
                </IconButton>
              </Box>
              <List>
                {recentUsers.map((user, index) => (
                  <React.Fragment key={user.email}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={user.avatar}>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">{user.name}</Typography>
                            <Chip
                              label={user.role}
                              size="small"
                              color={user.role === 'Customer' ? 'primary' : 'secondary'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Joined: {user.joinDate}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentUsers.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* System Alerts */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">System Alerts</Typography>
                <IconButton size="small">
                  <Notifications />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                {alerts.map((alert, index) => (
                  <Grid item xs={12} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label={alert.type.toUpperCase()}
                            size="small"
                            color={getAlertColor(alert.type)}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {alert.time}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {alert.message}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Stock Alerts */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Stock Alerts</Typography>
                <IconButton size="small">
                  <Warning />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                {stockAlerts.map((item, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1">{item.product}</Typography>
                          <Chip
                            label={item.status.toUpperCase()}
                            size="small"
                            color={getStockStatusColor(item.status)}
                          />
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Current Stock: {item.stock}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Threshold: {item.threshold}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(item.stock / item.threshold) * 100}
                            color={getStockStatusColor(item.status)}
                            sx={{ mt: 1 }}
                          />
                        </Box>
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

export default AdminDashboard;

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Button,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Settings,
  Warehouse,
  People,
  Security,
  AdminPanelSettings,
  Inventory,
  ShoppingCart,
  LocalShipping,
  Store,
  Logout as LogoutIcon,
  ShoppingBag as OrderIcon,
  AccountCircle,
} from '@mui/icons-material';
import {logout , selectRoleName , selectUser } from '../../store/slices/authSlice';
import logger from '../../utils/logger';
import { selectCartItems } from '../../store/slices/cartSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roleName = useSelector(selectRoleName);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const cartItems = useSelector(selectCartItems);
  
  const isMobileMenuOpen = Boolean(mobileMenuAnchor);
  const isUserMenuOpen = Boolean(userMenuAnchor);
  const userMenuId = 'primary-user-account-menu';
  const mobileMenuId = 'primary-mobile-menu';

  // Calculate total items in cart
  const cartItemCount = cartItems?.items?.length || 0;

  // Menu items based on role
  const getMenuItems = () => {
    console.log(user);
    console.log(roleName);
   
    switch (roleName.toLowerCase()) {
      case 'super admin':
        return [
          { title: 'Users', path: '/users', icon: <People /> },
          { title: 'Roles', path: '/roles', icon: <AdminPanelSettings /> },
          { title: 'Permissions', path: '/permissions', icon: <Security /> },
          { title: 'Permission Relations', path: '/permission-relations', icon: <Security /> },
          { title: 'Warehouse', path: '/warehouse', icon: <Warehouse /> },
          { title: 'My Profile', path: '/profile', icon: <Person /> },
          { title: 'Settings', path: '/settings', icon: <Settings /> },
          { title: 'Orders', path: '/orders', icon: <OrderIcon /> },
        ];
      case 'customer':
        return [
          { title: 'Products', path: '/products', icon: <Store /> },
          { title: 'My Profile', path: '/profile', icon: <Person /> },
          { title: 'Settings', path: '/settings', icon: <Settings /> },
          { title: 'Orders', path: '/orders', icon: <OrderIcon /> },
        ];
      case 'warehouse worker':
        return [
          { title: 'Orders', path: '/orders', icon: <OrderIcon /> },
          { title: 'Inventory', path: '/inventory', icon: <Inventory /> },
          { title: 'My Profile', path: '/profile', icon: <Person /> },
          { title: 'Settings', path: '/settings', icon: <Settings /> },
        ];
      case 'driver':
        return [
          { title: 'Ready Orders', path: '/ready-orders', icon: <LocalShipping /> },
          { title: 'My Profile', path: '/profile', icon: <Person /> },
          { title: 'Settings', path: '/settings', icon: <Settings /> },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMobileMenuAnchor(null);
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add token if required
        },
      });

      if (response.ok) {
        // Dispatch logout action to clear Redux state
        dispatch(logout());
        // Navigate to login page
        navigate('/');
        logger.info('User logged out successfully');
      } else {
        logger.error('Logout failed on server side');
        // Logout anyway to clear local state
        dispatch(logout());
        navigate('/');
      }
    } catch (error) {
      logger.error('Logout error:', error);
      // Logout anyway to clear local state
      dispatch(logout());
      navigate('/');
    }
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div">
          Rapid Reach
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.title}
            onClick={() => {
              navigate(item.path);
              handleMenuClose();
            }}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo/Brand - Always visible */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              flexGrow: 0,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              mr: 4
            }}
            onClick={() => navigate('/')}
          >
            Your Logo
          </Typography>

          {/* Main Navigation Links - Hide on mobile */}
          <Box sx={{ 
            flexGrow: 1,
            display: { xs: 'none', md: 'flex' },
            gap: 2
          }}>
            <MenuItem onClick={() => navigate('/products')}>
              Products
            </MenuItem>
            <MenuItem onClick={() => navigate('/orders')}>
              Orders
            </MenuItem>
            {/* Add other navigation items here */}
          </Box>

          {/* Mobile Menu Button - Show only on mobile */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Right-side Icons */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2
          }}>
            {/* Cart Icon */}
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/cart')}
            >
              <Badge 
                badgeContent={cartItems?.items?.length || 0} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    right: -3,
                    top: 3,
                  }
                }}
              >
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <Box>
              <IconButton
                onClick={handleUserMenuOpen}
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={userMenuId}
                aria-haspopup="true"
                color="inherit"
              >
                {user?.profilePicture ? (
                  <Avatar 
                    src={user.profilePicture} 
                    alt={user.name}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Box>
          </Box>

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            id={mobileMenuId}
            keepMounted
            open={isMobileMenuOpen}
            onClose={handleMenuClose}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            <MenuItem onClick={() => { navigate('/products'); handleMenuClose(); }}>
              Products
            </MenuItem>
            <MenuItem onClick={() => { navigate('/orders'); handleMenuClose(); }}>
              Orders
            </MenuItem>
            <MenuItem onClick={() => { navigate('/cart'); handleMenuClose(); }}>
              Cart
            </MenuItem>
            {/* Add other mobile menu items here */}
          </Menu>

          {/* User Menu */}
          <Menu
            anchorEl={userMenuAnchor}
            id={userMenuId}
            keepMounted
            open={isUserMenuOpen}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 
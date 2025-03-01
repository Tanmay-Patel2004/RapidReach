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
} from '@mui/icons-material';
import { selectUser, logout } from '../../store/slices/authSlice';
import logger from '../../utils/logger';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Menu items based on role
  const getMenuItems = () => {
    const roleName = user?.role_id?.name?.toLowerCase();
    
    switch (roleName) {
      case 'super admin':
        return [
          { title: 'Users', path: '/users', icon: <People /> },
          { title: 'Roles', path: '/roles', icon: <AdminPanelSettings /> },
          { title: 'Permissions', path: '/permissions', icon: <Security /> },
          { title: 'Permission Relations', path: '/permission-relations', icon: <Security /> },
          { title: 'Warehouse', path: '/warehouse', icon: <Warehouse /> },
          { title: 'My Profile', path: '/profile', icon: <Person /> },
          { title: 'Settings', path: '/settings', icon: <Settings /> },
        ];
      case 'customer':
        return [
          { title: 'Products', path: '/products', icon: <Store /> },
          { title: 'My Profile', path: '/profile', icon: <Person /> },
          { title: 'Settings', path: '/settings', icon: <Settings /> },
        ];
      case 'warehouse worker':
        return [
          { title: 'Orders', path: '/orders', icon: <ShoppingCart /> },
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

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
              setMobileOpen(false);
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
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
            >
              Rapid Reach
            </Typography>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user?.firstName} src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { 
                  handleLogout(); 
                  handleCloseUserMenu(); 
                }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center" color="error">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, marginTop: '64px' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default Navbar; 
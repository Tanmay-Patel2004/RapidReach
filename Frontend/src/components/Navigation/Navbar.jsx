import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
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
  useTheme as useMuiTheme,
} from "@mui/material";
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
  Person as PersonIcon,
  Dashboard,
  Assessment as AssessmentIcon,
  LightMode,
  DarkMode,
} from "@mui/icons-material";
import {
  logout,
  selectRoleName,
  selectUser,
} from "../../store/slices/authSlice";
import logger from "../../utils/logger";
import { selectCartItems } from "../../store/slices/cartSlice";
import { useTheme } from "../../contexts/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roleName = useSelector(selectRoleName);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const cartItems = useSelector(selectCartItems);
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  const isUserMenuOpen = Boolean(userMenuAnchor);
  const userMenuId = "primary-user-account-menu";

  // Calculate total items in cart
  const cartItemCount = cartItems?.items?.length || 0;

  // Menu items based on role
  const getMenuItems = () => {
    switch (roleName?.toLowerCase()) {
      case "super admin":
        return [
          { title: "Users", path: "/users", icon: <People /> },
          { title: "Roles", path: "/roles", icon: <AdminPanelSettings /> },
          { title: "Permissions", path: "/permissions", icon: <Security /> },
          {
            title: "Permission Relations",
            path: "/permission-relations",
            icon: <Security />,
          },
          { title: "Warehouse", path: "/warehouse", icon: <Warehouse /> },
          //{ title: "Orders", path: "/orders", icon: <OrderIcon /> },
          { title: "Reports", path: "/reports", icon: <AssessmentIcon /> },
        ];
      case "customer":
        return [
          { title: "Products", path: "/products", icon: <Store /> },
          { title: "Orders", path: "/orders", icon: <OrderIcon /> },
        ];
      case "warehouse worker":
        return [
          { title: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
          { title: "Products", path: "/product-management", icon: <Store /> },
        ];

      default:
        return [
          { title: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
        ];
    }
  };

  const menuItems = getMenuItems();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNavigation = (path) => {
    console.log("Navigating to:", path);
    navigate(path);
    setMobileOpen(false);
    handleUserMenuClose();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000/api"
        }/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Add token if required
          },
        }
      );

      if (response.ok) {
        // Dispatch logout action to clear Redux state
        dispatch(logout());
        // Navigate to login page
        navigate("/");
        logger.info("User logged out successfully");
      } else {
        logger.error("Logout failed on server side");
        // Logout anyway to clear local state
        dispatch(logout());
        navigate("/");
      }
    } catch (error) {
      logger.error("Logout error:", error);
      // Logout anyway to clear local state
      dispatch(logout());
      navigate("/");
    }
  };

  const drawer = (
    <Box
      sx={{
        width: 250,
        height: "100%",
        bgcolor: "background.paper",
      }}>
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          Rapid Reach
        </Typography>
      </Box>
      <Divider />
      <List sx={{ py: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.title}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "primary.light",
                color: "primary.dark",
                "&:hover": {
                  bgcolor: "primary.light",
                },
                "& .MuiListItemIcon-root": {
                  color: "primary.dark",
                },
              },
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}>
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{ fontSize: "0.95rem" }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: 2,
          background:
            mode === "dark"
              ? "linear-gradient(90deg, #1a237e 0%, #283593 100%)"
              : "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
        }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Left side - Logo and mobile menu trigger */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
              }}>
              Rapid Reach
            </Typography>
          </Box>

          {/* Right-side Icons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}>
            {/* Dark Mode Toggle */}
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              aria-label="toggle dark mode"
              sx={{
                borderRadius: 1,
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}>
              {mode === "dark" ? <LightMode /> : <DarkMode />}
            </IconButton>

            {/* Cart Icon */}
            {roleName?.toLowerCase() === "customer" && (
              <IconButton
                color="inherit"
                onClick={() => navigate("/cart")}
                sx={{
                  borderRadius: 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.15)",
                  },
                }}>
                <Badge
                  badgeContent={cartItemCount}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      right: -3,
                      top: 3,
                    },
                  }}>
                  <ShoppingCart />
                </Badge>
              </IconButton>
            )}

            {/* User Menu */}
            <Box>
              <Button
                onClick={handleUserMenuOpen}
                color="inherit"
                sx={{
                  gap: 1,
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.75,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.15)",
                  },
                }}>
                {user?.profilePicture ? (
                  <Avatar
                    src={user.profilePicture}
                    alt={user.name}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
                <Typography
                  variant="body2"
                  sx={{ display: { xs: "none", sm: "block" } }}>
                  {user?.name || "User"}
                </Typography>
              </Button>
            </Box>
          </Box>

          {/* User Menu */}
          <Menu
            anchorEl={userMenuAnchor}
            id={userMenuId}
            keepMounted
            open={isUserMenuOpen}
            onClose={handleUserMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                mt: 1.5,
                minWidth: 220,
                borderRadius: 2,
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  mx: 0.5,
                  my: 0.25,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                {user?.name || "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || "user@example.com"}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <MenuItem
              onClick={() => {
                handleNavigation("/profile");
              }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer for navigation */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: 250, boxSizing: "border-box" },
          }}>
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: 250,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            },
          }}
          open>
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default Navbar;

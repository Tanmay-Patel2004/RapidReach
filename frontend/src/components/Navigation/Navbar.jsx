import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Tooltip,
  Divider,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Navbar = () => {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Add debug logs
  console.log("Navbar rendered:", { user, userRole });

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate("/login");
  };

  // Define menu items and their required roles
  const menuItems = [
    {
      title: "Users",
      path: "/users",
      allowedRoles: ["admin"],
    },
    {
      title: "Roles",
      path: "/roles",
      allowedRoles: ["admin"],
    },
    {
      title: "Permissions",
      path: "/permissions",
      allowedRoles: ["admin"],
    },
  ];

  return (
    <AppBar
      position="static"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#fff",
        color: "#333",
        boxShadow: 1,
      }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            mr: 4,
            fontWeight: 700,
            color: "inherit",
            textDecoration: "none",
          }}>
          RapidReach
        </Typography>

        <Box sx={{ flexGrow: 1, display: "flex", gap: 2 }}>
          {user &&
            menuItems.map(
              (item) =>
                item.allowedRoles.includes(userRole) && (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: "inherit",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}>
                    {item.title}
                  </Button>
                )
            )}
        </Box>

        <Box sx={{ flexGrow: 0 }}>
          {user ? (
            <>
              <Tooltip title="Account settings">
                <IconButton onClick={handleOpenMenu}>
                  {user.avatar ? (
                    <Avatar
                      alt={user.firstName}
                      src={user.avatar}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircleIcon
                      sx={{ color: "inherit", fontSize: 32 }}
                    />
                  )}
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}>
                <MenuItem disabled>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#1976d2",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                    }}>
                    League of Legends , {user.firstName}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={handleCloseMenu}
                  component={RouterLink}
                  to="/profile">
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              color="primary"
              sx={{
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

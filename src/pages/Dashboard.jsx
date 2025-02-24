import React from "react";
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Container,
  Paper,
  Grid,
  IconButton,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
} from "@mui/icons-material";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const DashboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  minHeight: "100vh",
  paddingTop: 64, // Height of AppBar
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.spacing(1),
}));

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box>
      <StyledAppBar position="fixed">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RapidReach Dashboard
          </Typography>
          <IconButton color="inherit">
            <PersonIcon />
          </IconButton>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </StyledAppBar>

      <DashboardContainer>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {/* Welcome Card */}
            <Grid item xs={12}>
              <StyledPaper elevation={0}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                    {user?.email?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h5" component="h1">
                    Welcome back, {user?.email?.split("@")[0]}
                  </Typography>
                </Box>
              </StyledPaper>
            </Grid>

            {/* Stats Cards */}
            <Grid item xs={12} md={4}>
              <StyledPaper elevation={0}>
                <Typography variant="h6" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h3" color="primary">
                  0
                </Typography>
              </StyledPaper>
            </Grid>

            <Grid item xs={12} md={4}>
              <StyledPaper elevation={0}>
                <Typography variant="h6" gutterBottom>
                  Active Deliveries
                </Typography>
                <Typography variant="h3" color="primary">
                  0
                </Typography>
              </StyledPaper>
            </Grid>

            <Grid item xs={12} md={4}>
              <StyledPaper elevation={0}>
                <Typography variant="h6" gutterBottom>
                  Completed Deliveries
                </Typography>
                <Typography variant="h3" color="primary">
                  0
                </Typography>
              </StyledPaper>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <StyledPaper elevation={0}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Typography color="text.secondary">
                  No recent activity to display.
                </Typography>
              </StyledPaper>
            </Grid>
          </Grid>
        </Container>
      </DashboardContainer>
    </Box>
  );
};

export default Dashboard;

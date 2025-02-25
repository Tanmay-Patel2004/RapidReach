import React from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}>
        <Typography variant="h4">Customer Dashboard</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<PersonIcon />}
            onClick={() => navigate("/profile")}
            sx={{
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}>
            Profile
          </Button>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            sx={{
              borderColor: "error.main",
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.lighter",
                borderColor: "error.dark",
              },
            }}>
            Logout
          </Button>
        </Stack>
      </Box>

      <Typography>Welcome to your Customer Dashboard</Typography>
    </Box>
  );
};

export default CustomerDashboard;

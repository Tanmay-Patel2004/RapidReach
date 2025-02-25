import React from "react";
import { Typography, Container } from "@mui/material";

const CustomerDashboard = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Customer Dashboard
      </Typography>
      <Typography>Welcome to your customer dashboard!</Typography>
    </Container>
  );
};

export default CustomerDashboard;

import React from "react";
import { Box, Typography, Container, Paper } from "@mui/material";

const TestReportPage = () => {
  console.log("TestReportPage rendering");

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Test Report Page
        </Typography>
        <Typography variant="body1">
          This is a test page to debug routing issues. If you can see this, the
          routing is working correctly.
        </Typography>
      </Paper>
    </Container>
  );
};

export default TestReportPage;

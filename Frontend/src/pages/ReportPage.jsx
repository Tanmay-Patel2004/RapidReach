import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { format } from "date-fns";
import axios from "axios";

const ReportPage = () => {
  console.log("ReportPage component rendering");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 3; i <= currentYear; i++) {
    years.push(i);
  }

  const fetchReport = async () => {
    console.log(`Fetching report for month: ${month}, year: ${year}`);
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      console.log("Auth token:", token ? "Present" : "Missing");

      const response = await axios.get(
        `http://localhost:3000/api/orders/report?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API response:", response.data);

      if (response.data.code === 200) {
        setReportData(response.data.data);
        console.log("Report data loaded successfully");
      } else {
        setError(response.data.message || "Failed to fetch report");
        console.error("API error:", response.data.message);
        setSnackbar({
          open: true,
          message: response.data.message || "Failed to fetch report",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      setError(error.response?.data?.message || "Failed to fetch report");
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to fetch report",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!reportData) return;

    try {
      // Dynamically import the PDF libraries only when needed
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      console.log("PDF libraries loaded successfully");

      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text(
        `Monthly Orders Report - ${
          months.find((m) => m.value === month)?.label
        } ${year}`,
        14,
        22
      );

      // Add summary
      doc.setFontSize(12);
      doc.text(`Total Orders: ${reportData.totalOrders}`, 14, 35);
      doc.text(`Total Amount: $${reportData.totalAmount.toFixed(2)}`, 14, 42);

      // Add table with orders
      const tableColumn = ["Order ID", "Date", "Customer", "Amount", "Status"];
      const tableRows = [];

      reportData.orders.forEach((order) => {
        const orderData = [
          order.orderId.substring(order.orderId.length - 6).toUpperCase(),
          format(new Date(order.date), "MMM dd, yyyy"),
          order.customer,
          `$${order.amount.toFixed(2)}`,
          order.status,
        ];
        tableRows.push(orderData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Page ${i} of ${pageCount} - Generated on ${format(
            new Date(),
            "MMM dd, yyyy"
          )}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      doc.save(`Orders_Report_${month}_${year}.pdf`);

      setSnackbar({
        open: true,
        message: "Report downloaded successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setSnackbar({
        open: true,
        message: "Failed to generate PDF: " + error.message,
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    console.log("ReportPage useEffect triggered");
    if (month && year) {
      fetchReport();
    }
  }, [month, year]);

  console.log("Current state:", {
    month,
    year,
    loading,
    error,
    reportData: reportData ? "Has data" : "No data",
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Monthly Orders Report
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="month-select-label">Month</InputLabel>
              <Select
                labelId="month-select-label"
                id="month-select"
                value={month}
                label="Month"
                onChange={(e) => setMonth(e.target.value)}>
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="year-select-label">Year</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={year}
                label="Year"
                onChange={(e) => setYear(e.target.value)}>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
            sx={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={downloadPdf}
              disabled={!reportData || loading}
              fullWidth
              sx={{ height: 56 }}>
              Download PDF
            </Button>
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : reportData ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body1">
                Total Orders: {reportData.totalOrders}
              </Typography>
              <Typography variant="body1">
                Total Amount: ${reportData.totalAmount.toFixed(2)}
              </Typography>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.orders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell>
                        {order.orderId
                          .substring(order.orderId.length - 6)
                          .toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell align="right">
                        ${order.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{order.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Typography variant="body1" sx={{ textAlign: "center", my: 4 }}>
            Select a month and year to generate a report
          </Typography>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}>
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ReportPage;

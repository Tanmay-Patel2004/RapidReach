import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navigation/Navbar";
import AppRoutes from "./routes";
import { Box } from "@mui/material";

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#9c27b0",
    },
  },
});

// Wrapper component to access location
const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <AuthProvider>
      <Box sx={{ width: "100%" }}>
        {!isAuthPage && <Navbar />}
        <Box
          component="main"
          sx={{
            p: 3,
            width: "100%",
            minHeight: "calc(100vh - 64px)", // 64px is AppBar height
            backgroundColor: "#f5f5f5",
          }}>
          <AppRoutes />
        </Box>
      </Box>
    </AuthProvider>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;

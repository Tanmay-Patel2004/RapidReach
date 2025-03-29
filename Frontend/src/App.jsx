import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, Toolbar } from '@mui/material';
import logger from "./utils/logger";
import Navbar from "./components/Navigation/Navbar";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import DriverDashboard from "./pages/dashboards/DriverDashboard";
import ProfilePage from "./pages/ProfilePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from './pages/ProductDetailsPage';
import {
  restoreAuthState,
  selectIsAuthenticated,
  selectUserRole,
  loginSuccess,
  logout,
} from "./store/slices/authSlice";
import SectionPage from './components/common/SectionPage';
import { getStoredAuthState } from './middleware/authMiddleware';
import { api } from './utils/api';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  useEffect(() => {
    const storedAuthState = getStoredAuthState();
    if (storedAuthState) {
      dispatch(restoreAuthState(storedAuthState));
    }
  }, [dispatch]);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await api.fetch('/auth/verify');
        const data = await response.json();
        
        if (data.code === 200) {
          dispatch(loginSuccess(data.data));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        dispatch(logout());
      }
    };

    verifyAuth();
  }, [dispatch]);

  const DashboardComponent = useMemo(() => {
    if (!userRole) {
      logger.warn("No user role found");
      return null;
    }

    // Get role name from the role object
    const roleName = userRole.name;

    if (!roleName) {
      logger.warn("Could not determine role name", userRole);
      return <Navigate to="/" replace />;
    }

    logger.info(`Rendering dashboard for role: ${roleName}`);

    switch (roleName.toLowerCase()) {
      case "super admin":
        return <AdminDashboard />;
      case "customer":
        return <CustomerDashboard />;
      case "driver":
        return <DriverDashboard />;
      default:
        logger.warn(`Unknown role: ${roleName}`);
        return <Navigate to="/" replace />;
    }
  }, [userRole]);

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          ml: { sm: '250px' },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          p: 0,
          overflowX: 'hidden',
        }}
      >
        <Toolbar />
        <Routes>
          <Route
            path="/dashboard"
            element={<ProtectedRoute>{DashboardComponent}</ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute>
                <ProductDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <SectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute>
                <SectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions"
            element={
              <ProtectedRoute>
                <SectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permission-relations"
            element={
              <ProtectedRoute>
                <SectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute>
                <SectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;

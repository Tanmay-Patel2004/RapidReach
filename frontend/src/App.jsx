import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import logger from "./utils/logger";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import DriverDashboard from "./pages/dashboards/DriverDashboard";
import {
  restoreAuthState,
  selectIsAuthenticated,
  selectUserRole,
} from "./store/slices/authSlice";

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  useEffect(() => {
    dispatch(restoreAuthState());
    logger.info("Auth state restored from localStorage");
  }, [dispatch]);

  // Function to determine which dashboard to show based on role
  const DashboardComponent = () => {
    console.log('Current user role:', userRole);
    switch (userRole) {
      case "admin":
        return <AdminDashboard />;
      case "customer":
        return <CustomerDashboard />;
      case "driver":
        return <DriverDashboard />;
      default:
        console.log('No matching role, redirecting to login');
        return <Navigate to="/" replace />;
    }
  };

  return (
    <Routes>
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" element={<DashboardComponent />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;

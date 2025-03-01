import { use, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import logger from "./utils/logger";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import DriverDashboard from "./pages/dashboards/DriverDashboard";
import ProfilePage from "./pages/ProfilePage";
import {
  restoreAuthState,
  selectIsAuthenticated,
  selectUserRole,
} from "./store/slices/authSlice";

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  // Run only once when component mounts
  useEffect(() => {
    dispatch(restoreAuthState());
    logger.info("Auth state restored from localStorage");
  }, []); // Empty dependency array

  // Memoize the DashboardComponent to prevent unnecessary re-renders
  const DashboardComponent = useMemo(() => {
    if (!userRole) {
      logger.warn("No user role found");
      return null;
    }

    // Get the role name from the role object
    const roleName = userRole.name;
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
  }, [userRole]); // Only re-run when userRole changes

  // Protected Route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {isAuthenticated ? (
        <>
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

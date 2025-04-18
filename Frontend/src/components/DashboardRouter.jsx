import { useSelector } from "react-redux";
import { selectUserRole } from "../store/slices/authSlice";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import CustomerDashboard from "../pages/dashboards/CustomerDashboard";
import DriverDashboard from "../pages/dashboards/DriverDashboard";
import WarehouseDashboard from "../pages/dashboards/WarehouseDashboard";

const DashboardRouter = () => {
  const userRole = useSelector(selectUserRole);

  // Render dashboard based on role
  switch (userRole?.name) {
    case "Super Admin":
      return <AdminDashboard />;
    case "driver":
      return <DriverDashboard />;
    case "customer":
      return <CustomerDashboard />;
    case "warehouse worker":
      return <WarehouseDashboard />;
    default:
      return <div>Access Denied: Invalid Role</div>;
  }
};

export default DashboardRouter;

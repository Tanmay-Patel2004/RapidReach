import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RouteGuard = ({ children, allowedRoles }) => {
  const { user, userRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default RouteGuard; 
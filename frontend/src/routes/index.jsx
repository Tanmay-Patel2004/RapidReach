import { Routes, Route, Navigate } from 'react-router-dom';
import RouteGuard from '../components/RouteGuard';
import Login from '../pages/Login';
import Users from '../pages/Users';
import Roles from '../pages/Roles';
import Permissions from '../pages/Permissions';
import Unauthorized from '../pages/Unauthorized';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Redirect root to users page for logged-in users */}
      <Route 
        path="/" 
        element={
          <RouteGuard allowedRoles={['admin']}>
            <Navigate to="/users" replace />
          </RouteGuard>
        } 
      />
      
      <Route 
        path="/users" 
        element={
          <RouteGuard allowedRoles={['admin']}>
            <Users />
          </RouteGuard>
        } 
      />
      
      <Route 
        path="/roles" 
        element={
          <RouteGuard allowedRoles={['admin']}>
            <Roles />
          </RouteGuard>
        } 
      />
      
      <Route 
        path="/permissions" 
        element={
          <RouteGuard allowedRoles={['admin']}>
            <Permissions />
          </RouteGuard>
        } 
      />

      {/* Catch all route - redirect to users */}
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
};

export default AppRoutes; 
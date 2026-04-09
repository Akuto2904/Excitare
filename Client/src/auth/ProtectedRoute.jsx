import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Protects routes based on authentication and optional role.
 * - If no user → redirect to /admin/login.
 * - If requiredRole is provided and user.role does not match → redirect to main app.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Non-admin users should not see admin tools.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import AdminLoginPage from './AdminLoginPage';
import AdminDashboardPage from './AdminDashboardPage';
import ManageUsersPage from './ManageUsersPage';
import ManageAlarmsPage from './ManageAlarmsPage';
import ProtectedRoute from '../auth/ProtectedRoute';

// Admin entry point – can be mounted from main.jsx or used in tests.
const AdminApp = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* All routes below require an authenticated admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageUsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/alarms"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageAlarmsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all – send unknown admin paths to dashboard if logged in, else login */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AdminApp;
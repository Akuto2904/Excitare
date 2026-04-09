import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MainMenuPage from './pages/MainMenuPage';
import ViewAlarmsPage from './pages/ViewAlarmsPage';
import AlarmDetailPage from './pages/AlarmDetailPage';
import SettingsPage from './pages/SettingsPage';

import AdminLoginPage from './admin/AdminLoginPage';
import AdminDashboardPage from './admin/AdminDashboardPage';
import ManageUsersPage from './admin/ManageUsersPage';
import ManageAlarmsPage from './admin/ManageAlarmsPage';

import ProtectedRoute from './auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Client routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/menu" element={<MainMenuPage />} />
      <Route path="/alarms" element={<ViewAlarmsPage />} />
      <Route path="/alarms/:id" element={<AlarmDetailPage />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
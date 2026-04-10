import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import '../styles/variables.css';
import '../styles/global.css';
import '../styles/main-menu.css';
import logo from '../assets/logo.png';

const AdminLayout = ({ title, children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="page-wrapper" style={{ padding: '2rem' }}>
      <div className="page-card" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <header className="main-menu-navbar">
          <div>
            <img
              src={logo}
              alt="Alarm admin logo"
              className="navbar-logo"
            />
          </div>

          <div className="navbar-center">
            <h1 className="navbar-title">Admin Panel</h1>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={logout}
          >
            <span className="logout-icon">⎋</span>
            <span>Log out</span>
          </button>
        </header>

        <nav style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/admin" className="btn btn-sm btn-outline-secondary">
            Dashboard
          </Link>
          <Link to="/admin/users" className="btn btn-sm btn-outline-secondary">
            Manage Users
          </Link>
          <Link to="/admin/alarms" className="btn btn-sm btn-outline-secondary">
            Manage Alarms & Reviews
          </Link>
          {user && (
            <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#555' }}>
              Signed in as <strong>{user.email}</strong> ({user.role})
            </span>
          )}
        </nav>

        <main>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
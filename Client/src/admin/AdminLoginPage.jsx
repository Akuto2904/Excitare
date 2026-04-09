import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import '../styles/variables.css';
import '../styles/global.css';
import '../styles/login.css';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      const user = await login(form);
      const redirectTo = location.state?.from?.pathname || '/admin';
      // Only allow admins into the admin area.
      if (user.role === 'admin') {
        navigate(redirectTo, { replace: true });
      } else {
        alert('You are logged in as a normal user. Admin access is restricted.');
        navigate('/', { replace: true });
      }
    } catch (e) {
      // Error state already set inside context.
    }
  };

  return (
    <div className="page-wrapper" style={{ justifyContent: 'center' }}>
      <div className="page-card login-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img
            src="/PlaceHolder.jpg"
            alt="Alarm admin logo"
            className="login-logo"
          />
          <h1 className="app-title">Alarm Admin Login</h1>
          <p>Sign in with your management account to moderate users and reviews.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label-custom">
              Admin Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label-custom">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p style={{ color: '#dc3545', marginBottom: '0.75rem' }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn login-btn w-100"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in as Admin'}
          </button>

          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
            For demo purposes, use <strong>admin@example.com</strong> as the email to
            log in with an admin role. Other emails will be treated as normal
            users.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
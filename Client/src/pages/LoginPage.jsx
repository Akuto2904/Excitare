// Login page for users to access the app
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Page specific styling
import '../styles/login.css';

import logo from '../assets/logo.png';

function LoginPage() {
  // Redirects the user after login
  const navigate = useNavigate();

  // Gets auth functions and state from AuthContext
  const { login, loading, error } = useAuth();

  // Stores form input values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handles login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Calls the temporary frontend login function
      const loggedInUser = await login({ email, password });

      // Redirect admin users to admin area
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        // Redirect normal users to main menu
        navigate('/menu');
      }
    } catch (err) {
      // Error text is already handled in AuthContext,
      // but this helps with debugging in the console
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="container page-wrapper">
      <div className="login-card mx-auto page-card">
        {/* App title */}
        <h1 className="text-center mb-3 app-title">Excitare</h1>

        {/* App logo */}
        <div className="text-center mb-3">
          <img src={logo} alt="Excitare Logo" className="login-logo" />
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label form-label-custom">
              Email
            </label>

            {/* Email input field */}
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password input field */}
          <div className="mb-4">
            <label htmlFor="password" className="form-label form-label-custom">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Shows auth error if login fails */}
          {error && <p className="text-danger mb-3">{error}</p>}

          {/* Submit button */}
          <button
            type="submit"
            className="btn login-btn w-100"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Forgot password link */}
          <div className="text-center mt-3">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot password?
            </Link>
          </div>

          {/* Temporary login help text */}
          <div className="text-center mt-4">
            <p className="mb-1">
              <strong>Test user:</strong> test@example.com
            </p>
            <p className="mb-1">
              <strong>Admin user:</strong> admin@example.com
            </p>
            <p className="mb-0">
              <strong>Password:</strong> anything for now
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
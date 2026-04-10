import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import '../styles/login.css';
import logo from '../assets/logo.png';

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const loggedInUser = await login({ email, password });

      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/menu');
      }
    } catch (err) {
      console.error('Login failed:', err.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="page-wrapper">
        <div className="login-card text-center">
          <img src={logo} alt="Excitare logo" className="login-logo mb-3" />
          <h1 className="app-title mb-4">Excitare</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label htmlFor="email" className="form-label form-label-custom">
                Email
              </label>
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

            <div className="mb-3 text-start">
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

            {error && <p className="text-danger small">{error}</p>}

            <button type="submit" className="btn login-btn w-100" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-3">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
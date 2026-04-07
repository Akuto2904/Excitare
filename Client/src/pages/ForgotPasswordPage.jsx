// Page for users to request a password reset

import { Link } from 'react-router-dom';
import '../styles/login.css'; // reused login styling for consistency

function ForgotPasswordPage() {
  return (
    <div className="container page-wrapper">
      <div className="login-card mx-auto page-card">

        {/* Page title */}
        <h1 className="text-center mb-3">Excitare</h1>

        <h2 className="text-center mb-4">Reset Password</h2>

        {/* Instructions */}
        <p className="text-center mb-4">
          Enter your email and we will send you a password reset link.
        </p>

        {/* Reset form */}
        <form>
          <div className="mb-4">
            <label htmlFor="resetEmail" className="form-label">
              Email
            </label>

            <input
              type="email"
              id="resetEmail"
              className="form-control"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Submit button */}
          <button className="btn login-btn w-100 mb-3">
            Send Reset Link
          </button>

          {/* Back button */}
          <Link to="/" className="btn btn-outline-secondary w-100">
            Back to Login
          </Link>
        </form>

      </div>
    </div>
  );
}

export default ForgotPasswordPage;
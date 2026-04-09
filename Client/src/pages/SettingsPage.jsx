// login page for users to access the app
import { useNavigate, Link } from 'react-router-dom';

//page specific styling
import '../styles/login.css';

import logo from '../assets/logo.png';

//redirects the user to another page
function LoginPage() {
  const navigate = useNavigate();

  //Handles login form submission
  const handleSubmit = (e) => {
    e.preventDefault(); //stops page reload
    
    //temporary nav ( gonna replace with API login later)
    navigate('/menu');
  };

  return (
    <div className="container page-wrapper">
      <div className="login-card mx-auto page-card">
        
        {/* App title */}
           <h1 className="text-center mb-3 app-title">Excitare</h1>
        
        {/*App logo */} 
        <div className="text-center mb-3"> 
          <img src={logo} alt="Excitare Logo" className="logo" />
        </div>


        
        {/*Login form*/}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
           <label htmlFor="email" className="form-label form-label-custom">
             Email
           </label>
            
           {/*Email input field*/}
            <input
              type="email"
              id="email"
              className="form-control"
              required
            />
          </div>

           {/*Password input field*/}
          <div className="mb-4">
            <label htmlFor="password" className="form-label form-label-custom">
             Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              required
            />
          </div>
 
         {/*Submut button*/}
          <button type="submit" className="btn login-btn w-100">
            Sign In
          </button>

{/*Forgot password link*/} 
<div className="text-center mt-3">
  <Link to="/forgot-password" className="forgot-password-link">
  Forgot password?
           </Link>
         </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
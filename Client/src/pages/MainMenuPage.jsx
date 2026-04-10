import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';
import { getAlarmById } from '../services/alarmService';
import { getAlarmRating } from '../services/reviewService';
import '../styles/main-menu.css';
import logo from '../assets/logo.png';

function MainMenuPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [currentAlarmName, setCurrentAlarmName] = useState(
    localStorage.getItem('currentAlarmName') || 'Not set yet'
  );
  const [currentAlarmDescription, setCurrentAlarmDescription] = useState(
    'You have not chosen an alarm yet.'
  );
  const [currentAlarmRating, setCurrentAlarmRating] = useState('N/A');

  const handleLogout = () => {
    logout();
    localStorage.removeItem('currentAlarmName');
    localStorage.removeItem('currentAlarmId');
    navigate('/');
  };

  useEffect(() => {
    const currentAlarmId = localStorage.getItem('currentAlarmId');

    const fetchCurrentAlarmData = async () => {
      if (!currentAlarmId) {
        setCurrentAlarmName('Not set yet');
        setCurrentAlarmDescription('You have not chosen an alarm yet.');
        setCurrentAlarmRating('N/A');
        return;
      }

      try {
        const alarmData = await getAlarmById(currentAlarmId);
        const ratingData = await getAlarmRating(currentAlarmId);

        setCurrentAlarmName(alarmData.name);
        setCurrentAlarmDescription(alarmData.description);
        setCurrentAlarmRating(ratingData.Score ?? 'N/A');
      } catch (err) {
        console.error('Failed to load current alarm info:', err);
        setCurrentAlarmRating('N/A');
      }
    };

    fetchCurrentAlarmData();
  }, []);

  return (
    <div className="container py-5">
      <div className="main-menu-navbar">
        <div className="navbar-left">
          <img src={logo} alt="Excitare logo" className="navbar-logo" />
        </div>

        <div className="navbar-center">
          <h1 className="navbar-title">Excitare</h1>
        </div>

        <div className="navbar-right">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="logout-icon" />
            Log Out
          </button>
        </div>
      </div>
      

     
     
     <div className="main-menu-layout">

  {/* Current alarm */}
  <div className="dashboard-card current-alarm-card">
    <h3 className="section-heading">Current Alarm</h3>
    <h4 className="alarm-name">{currentAlarmName}</h4>
    <p className="alarm-rating">⭐ {currentAlarmRating}</p>
    <p className="alarm-description">{currentAlarmDescription}</p>
  </div>

  {/* Bottom row */}
  <div className="bottom-card-row">

    <Link to="/alarms" className="action-link">
      <div className="dashboard-card action-card">
        <h3 className="section-heading">View Alarms</h3>
        <p className="action-text">Browse and select alarms</p>
      </div>
    </Link>

    <Link to="/settings" className="action-link">
      <div className="dashboard-card action-card">
        <h3 className="section-heading">Settings</h3>
        <p className="action-text">Manage your preferences</p>
      </div>
    </Link>

  </div>
</div>
    </div>
  );
}

export default MainMenuPage;
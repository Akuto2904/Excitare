// Displays a list of available alarms
import React, { useState, useEffect } from 'react';
import { getAlarms } from '../services/alarmService'
import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import '../styles/alarms.css';
import '../styles/main-menu.css';
import logo from '../assets/logo.png';

function ViewAlarmsPage() {
  //Stores the alarms returned from the backend
   const [alarms, setAlarms] = useState([]);

   //used o show loading anerror states while data  being fetched
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   
   // Gets the currently selected alarm from local storage
   const currentAlarm =
   localStorage.getItem('currentAlarmName') || 'Not set yet';


   //Runs once when the page loads
   useEffect(() => {
    const fetchAlarms = async () => {
      try {
        //Gets all alarms from the backend API
        const data = await getAlarms();
        setAlarms(data);
      } catch (err) {
        setError("Failed to load alarms.");
        console.error(err);
      } finally {
        //Stops the loading message once the request has finished.
        setLoading(false);
      }
    };

    fetchAlarms();
  }, []);

  //Loading state
  if (loading){
       return <p className="container py-5">Loading alarms...</p>;
  }
  
  //Error state
  if (error){
     return <p className="container py-5">{error}</p>;
  }
 
  return (
    <div className="container py-5">
      {/* Top navigation bar */}
      <div className="main-menu-navbar">
        <div className="navbar-left">
          <img src={logo} alt="Excitare logo" className="navbar-logo" />
        </div>

        <div className="navbar-center">
          <h1 className="navbar-title">Excitare</h1>
        </div>

        <div className="navbar-right">
          <button className="logout-btn">
            <FiLogOut className="logout-icon" />
            Log Out
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="alarms-page-card">
        {/* Back button + current alarm */}
        <div className="alarms-header-row">
          <Link to="/menu" className="back-btn">
            Back
          </Link>

          <div className="current-alarm-badge">
  <span className="current-alarm-label">Current Alarm Chosen :  </span>
  <span className="current-alarm-name">{currentAlarm}</span>
</div>
        </div>

        {/* Page heading */}
        <h2 className="alarms-page-title">View Alarms</h2>

         {/* If there are no alarms returned */}
        {alarms.length === 0 ? (
          <p>No alarms found.</p>
        ) : (
          <div className="alarm-list">
            {alarms.map((alarm) => (
              <Link
                to={`/alarms/${alarm.id}`}
                className="alarm-button"
                key={alarm.id}
              >
                <span className="alarm-button-name">{alarm.name}</span>

                {/* Rating is a placeholder for now because backend does not return one yet */}
                <span className="alarm-button-rating">⭐ N/A</span>
              </Link>
           ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewAlarmsPage;
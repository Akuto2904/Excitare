// This file controls which page is shown depending on the URL

import { Routes, Route } from 'react-router-dom';

//import all main pages
import LoginPage from './pages/LoginPage';
import MainMenuPage from './pages/MainMenuPage';
import ViewAlarmsPage from './pages/ViewAlarmsPage';
import AlarmDetailPage from './pages/AlarmDetailPage';
import SettingsPage from './pages/SettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function App() {
  return (
    <Routes>
      //Default route is the login page
      <Route path="/" element={<LoginPage />} />
      
      //Main menu after login is successful
      <Route path="/menu" element={<MainMenuPage />} />

      //Alarms page shows a list of all alarms
      <Route path="/alarms" element={<ViewAlarmsPage />} />

      //Alarm detail page shows details of a specific alarm
      <Route path="/alarms/:id" element={<AlarmDetailPage />} />
      
      //User settings page
      <Route path="/settings" element={<SettingsPage />} />
    
    //Forgot password page
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    
    </Routes>
  );
}

export default App;
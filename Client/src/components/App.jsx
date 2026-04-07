// App.jsx - Controls which file is shown depending on the URL (routing). 
// Uses React Router to manage navigation between pages.


import {Routes, Route} from 'react-router-dom';

//imports all pages used in the app.
import LoginPage from './pages/LoginPage';
import MainMenuPage from './pages/MainMenuPage';
import ViewAlarmsPage from './pages/ViewAlarmsPage';
import AlarmDetailPage from './pages/AlarmDetailPage';
import SettingsPage from './pages/SettingsPage';

function App() {
    return ( 

        // routes contains all the the different paths in the app. 
        // Each path corresponds to a different page component.
        <Routes>
            //Dedault page (first page users always see)
            <Route path="/" element={<LoginPage />} />
            
            //Main menu after loging in
            <Route path="/main-menu" element={<MainMenuPage />} />
            
            //Page that shows all the alarms.
            <Route path="/view-alarms" element={<ViewAlarmsPage />} />
            
            //Page that shows details of a specific alarm. The ":id" part is a placeholder for the alarm's unique identifier.
            <Route path="/alarm-detail/:id" element={<AlarmDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
        </Routes>

    ) }

    export default App;
    
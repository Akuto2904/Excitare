//main.jsx - This is the entry point of the react app snd where everything is set up.

import react from 'react';
import ReactDom from 'react-dom/client';

//Used to allow navigation between pages without relouding the page.
import broweserRouter from 'react-router-dom';

//main app component.
import App from './App.jsx';

//Bootstrap for styling.
import 'bootstrap/dist/css/bootstrap.min.css'; 

//Global styles for whole app and css variables.
import './styles/global.css';
import './styles/variables.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
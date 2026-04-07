// This is the entry point of the React app
// This file connects the React to the HTML page


import React from 'react';
import ReactDOM from 'react-dom/client';

//Allows nav between pages without reloading
import { BrowserRouter } from 'react-router-dom';
import App from './App';


//Bootstrap for layout and UI components
import 'bootstrap/dist/css/bootstrap.min.css';

//Global styling accross the whole app
import './styles/global.css';
import './styles/variables.css';

//Renders the app into the root div in the index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom'; // ✅ belangrik
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>       {/* ✅ Router context begin */}
      <App />             {/* Jou hele app sit nou binne die router */}
    </BrowserRouter>      {/* ✅ Router context einde */}
  </React.StrictMode>
);

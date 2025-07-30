import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/authContext'; // Importe o AuthProvider

import "slick-carousel/slick/slick.css";
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* Envolva seu App com o AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
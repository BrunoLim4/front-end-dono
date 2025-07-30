import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/login';
import './styles.css';
import { useAuth } from './context/authContext'; // Importe o hook useAuth

function App() {
  const { isAuthenticated } = useAuth(); // Use o estado de autenticação do contexto

  return (
    <div className="App-dono">
      <Router>
        <Routes>
          {/* Rota de Login: Se já autenticado, redireciona para o dashboard */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />

          {/* Rota padrão: redireciona para o dashboard se autenticado, caso contrário para o login */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
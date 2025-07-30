import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import racingLogo from '/img/racing_rodape.png';
import { useAuth } from '../context/authContext'; // Importe o hook useAuth

const API_LOGIN_URL = import.meta.env.VITE_API_LOGIN_URL || 'http://localhost:3001/api'; // Ajustado para 3001

export default function Login() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Obtenha a função login do contexto

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_LOGIN_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: accessCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Código de acesso inválido.');
      }

      const data = await response.json();
      console.log('Login bem-sucedido!', data);

      if (data.token) {
        login(data.token); // Use a função login do contexto para definir o token
        navigate('/dashboard'); // Redireciona
      } else {
        throw new Error('Token de autenticação não recebido.');
      }

    } catch (err) {
      console.error('Erro de login:', err);
      setError(err.message || 'Ocorreu um erro ao tentar fazer login.');
    }
  };

  return (
    <div className="auth-container">
      <img src={racingLogo} alt="Logo da Escolinha Racing" className="logo" />
      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="password"
          placeholder="Código de acesso"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="auth-button">Entrar</button>
      </form>
    </div>
  );
}
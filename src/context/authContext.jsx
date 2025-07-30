import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  useEffect(() => {
    // Quando o token muda no estado, atualiza o localStorage
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  // O valor do contexto que será fornecido aos componentes filhos
  const authContextValue = {
    token,
    isAuthenticated: !!token, // Converte o token para booleano
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ username, password });
      const authData = res.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      return authData;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      const authData = res.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      return authData;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Quick switch role for college demo review presentation
  const switchDemoRole = async (roleName) => {
    const creds = {
      ROLE_CUSTOMER: { username: 'customer1', password: 'password123' },
      ROLE_AGENT: { username: 'agent1', password: 'password123' },
      ROLE_SURVEYOR: { username: 'surveyor1', password: 'password123' },
      ROLE_CLAIMS_OFFICER: { username: 'officer1', password: 'password123' },
      ROLE_ADMIN: { username: 'admin1', password: 'password123' }
    };
    const target = creds[roleName];
    if (target) {
      return await login(target.username, target.password);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await authService.getMe();
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        setUser(null);
        try {
          sessionStorage.removeItem('teamup_session_token');
        } catch (_) {}
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    if (data.token) {
      try {
        sessionStorage.setItem('teamup_session_token', data.token);
      } catch (_) {}
    }
    return data.user;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    if (data.token) {
      try {
        sessionStorage.setItem('teamup_session_token', data.token);
      } catch (_) {}
    }
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      try {
        sessionStorage.removeItem('teamup_session_token');
      } catch (_) {}
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

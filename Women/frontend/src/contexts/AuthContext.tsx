'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { socketClient } from '../services/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = api.getToken();
    if (savedToken) {
      setToken(savedToken);
      api
        .getProfile()
        .then((res) => {
          setUser(res.user);
          socketClient.connect(savedToken);
        })
        .catch(() => {
          api.setToken(null);
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setToken(res.token);
    socketClient.connect(res.token);
  };

  const register = async (payload: { name: string; email: string; phone: string; password: string }) => {
    const res = await api.register(payload);
    setUser(res.user);
    setToken(res.token);
    socketClient.connect(res.token);
  };

  const logout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    socketClient.disconnect();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
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

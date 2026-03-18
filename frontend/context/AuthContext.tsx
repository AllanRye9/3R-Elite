'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/lib/types';
import { api } from '@/lib/api';

const AUTH_ME_COOLDOWN_KEY = 'auth:meCooldownUntil';
const AUTH_ME_COOLDOWN_MS = 30_000;

let fetchMeRequest: Promise<void> | null = null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  country: 'UAE' | 'UGANDA';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const cooldownUntil = Number(sessionStorage.getItem(AUTH_ME_COOLDOWN_KEY) || '0');
      if (cooldownUntil > Date.now()) {
        setLoading(false);
        return;
      }
    }

    if (fetchMeRequest) {
      await fetchMeRequest;
      return;
    }

    fetchMeRequest = (async () => {
      try {
        const { data } = await api.get('/users/me');
        if (typeof window !== 'undefined') sessionStorage.removeItem(AUTH_ME_COOLDOWN_KEY);
        setUser(data);
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (typeof window !== 'undefined' && status === 429) {
          sessionStorage.setItem(AUTH_ME_COOLDOWN_KEY, String(Date.now() + AUTH_ME_COOLDOWN_MS));
        }
        setUser(null);
      } finally {
        fetchMeRequest = null;
        setLoading(false);
      }
    })();

    await fetchMeRequest;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('accessToken')) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  const login = async (email: string, password: string): Promise<User> => {
    const { data } = await api.post('/auth/login', { email, password });
    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    return data.user as User;
  };

  const register = async (formData: RegisterData) => {
    const { data } = await api.post('/auth/register', formData);
    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } finally {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

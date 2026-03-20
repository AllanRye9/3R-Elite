'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User } from '@/lib/types';
import { api, API_URL } from '@/lib/api';
import {
  clearAuthSession,
  getRefreshToken,
  getRemainingAuthSessionTime,
  hasStoredAuthSession,
  isAuthSessionExpired,
  migrateLegacyAuthSession,
  setAuthSession,
  touchAuthActivity,
} from '@/lib/authStorage';

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
  country: import('@/lib/types').Country;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTick, setSessionTick] = useState(0);

  const destroySession = useCallback(async (revokeRemoteToken = true) => {
    const refreshToken = getRefreshToken();

    try {
      if (revokeRemoteToken && refreshToken) {
        await axios.post(`${API_URL}/api/auth/logout`, { refreshToken });
      }
    } finally {
      clearAuthSession();
      setUser(null);
      setLoading(false);
    }
  }, []);

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
        touchAuthActivity(true);
        setUser(data);
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (typeof window !== 'undefined' && status === 429) {
          sessionStorage.setItem(AUTH_ME_COOLDOWN_KEY, String(Date.now() + AUTH_ME_COOLDOWN_MS));
        }
        if (status === 401 && typeof window !== 'undefined') {
          await destroySession(false);
          return;
        }
        setUser(null);
      } finally {
        fetchMeRequest = null;
        setLoading(false);
      }
    })();

    await fetchMeRequest;
  }, [destroySession]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    migrateLegacyAuthSession();

    if (!hasStoredAuthSession()) {
      setLoading(false);
      return;
    }

    if (isAuthSessionExpired()) {
      void destroySession(false);
      return;
    }

    touchAuthActivity(true);
    void fetchMe();
  }, [destroySession, fetchMe]);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasStoredAuthSession()) return;

    let inactivityTimeoutId: number | undefined;

    const scheduleInactivityLogout = () => {
      window.clearTimeout(inactivityTimeoutId);

      const remaining = getRemainingAuthSessionTime();
      if (remaining <= 0) {
        void destroySession();
        return;
      }

      inactivityTimeoutId = window.setTimeout(() => {
        void destroySession();
      }, remaining);
    };

    const handleActivity = () => {
      touchAuthActivity();
      scheduleInactivityLogout();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleActivity();
      }
    };

    scheduleInactivityLogout();

    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('focus', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearTimeout(inactivityTimeoutId);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('focus', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [destroySession, sessionTick, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || !['accessToken', 'refreshToken', 'auth:lastActivityAt'].includes(event.key)) return;

      setSessionTick((currentTick) => currentTick + 1);

      if (!hasStoredAuthSession()) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (isAuthSessionExpired()) {
        void destroySession(false);
        return;
      }

      if (event.key === 'auth:lastActivityAt') return;

      setLoading(true);
      void fetchMe();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [destroySession, fetchMe]);

  const login = async (email: string, password: string): Promise<User> => {
    const { data } = await api.post('/auth/login', { email, password });
    setAuthSession(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user as User;
  };

  const register = async (formData: RegisterData) => {
    const { data } = await api.post('/auth/register', formData);
    setAuthSession(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    await destroySession();
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

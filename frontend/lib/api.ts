import axios from 'axios';
import { clearAuthSession, getAccessToken, getRefreshToken, isAuthSessionExpired, setAuthSession } from '@/lib/authStorage';

// Strip trailing slashes so that template literals like `${API_URL}/api`
// never produce a double-slash (e.g. "https://example.com//api").
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    if (isAuthSessionExpired()) {
      clearAuthSession();
      return config;
    }

    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (typeof window !== 'undefined' && isAuthSessionExpired()) {
          clearAuthSession();
          return Promise.reject(error);
        }

        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
          setAuthSession(data.accessToken, data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        }
      } catch {
        clearAuthSession();
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

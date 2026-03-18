const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const LAST_ACTIVITY_AT_KEY = 'auth:lastActivityAt';
const ACTIVITY_WRITE_INTERVAL_MS = 60_000;

export const AUTH_INACTIVITY_TIMEOUT_MS = 4 * 60 * 60 * 1000;

function hasWindow() {
  return typeof window !== 'undefined';
}

function getLocalStorage() {
  return hasWindow() ? window.localStorage : null;
}

function getSessionStorage() {
  return hasWindow() ? window.sessionStorage : null;
}

export function migrateLegacyAuthSession() {
  const localStorage = getLocalStorage();
  const sessionStorage = getSessionStorage();

  if (!localStorage || !sessionStorage) return;

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);

  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if ((accessToken || refreshToken) && !localStorage.getItem(LAST_ACTIVITY_AT_KEY)) {
    localStorage.setItem(LAST_ACTIVITY_AT_KEY, String(Date.now()));
  }

  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return getLocalStorage()?.getItem(ACCESS_TOKEN_KEY) || null;
}

export function getRefreshToken() {
  return getLocalStorage()?.getItem(REFRESH_TOKEN_KEY) || null;
}

export function hasStoredAuthSession() {
  return Boolean(getAccessToken() && getRefreshToken());
}

export function getLastActivityAt() {
  const value = getLocalStorage()?.getItem(LAST_ACTIVITY_AT_KEY);
  return value ? Number(value) : null;
}

export function isAuthSessionExpired(now = Date.now()) {
  if (!hasStoredAuthSession()) return false;

  const lastActivityAt = getLastActivityAt();
  if (!lastActivityAt) return false;

  return now - lastActivityAt >= AUTH_INACTIVITY_TIMEOUT_MS;
}

export function getRemainingAuthSessionTime(now = Date.now()) {
  const lastActivityAt = getLastActivityAt();
  if (!lastActivityAt) return AUTH_INACTIVITY_TIMEOUT_MS;

  return Math.max(0, AUTH_INACTIVITY_TIMEOUT_MS - (now - lastActivityAt));
}

export function touchAuthActivity(force = false) {
  const localStorage = getLocalStorage();
  if (!localStorage || !hasStoredAuthSession()) return;

  const now = Date.now();
  const lastActivityAt = getLastActivityAt() || 0;

  if (!force && now - lastActivityAt < ACTIVITY_WRITE_INTERVAL_MS) return;
  localStorage.setItem(LAST_ACTIVITY_AT_KEY, String(now));
}

export function setAuthSession(accessToken: string, refreshToken: string) {
  const localStorage = getLocalStorage();
  if (!localStorage) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(LAST_ACTIVITY_AT_KEY, String(Date.now()));
}

export function clearAuthSession() {
  const localStorage = getLocalStorage();
  if (!localStorage) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(LAST_ACTIVITY_AT_KEY);
}

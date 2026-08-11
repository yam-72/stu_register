// Centralized helpers for storing/reading auth tokens and the current user.
// Keeping this in one place means AuthContext and the Axios interceptors
// never disagree about where a token lives.

const ACCESS_TOKEN_KEY = "srms_access_token";
const REFRESH_TOKEN_KEY = "srms_refresh_token";
const USER_KEY = "srms_user";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession({ token, refreshToken, user } = {}) {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function updateAccessToken(token) {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function hasRole(user, ...roles) {
  if (!user) return false;
  return roles.includes(user.role);
}

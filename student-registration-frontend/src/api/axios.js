import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  clearSession
} from "../utils/auth";

const baseURL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" }
});

// Attach the access token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(token) {
  pendingQueue.forEach(({ resolve, reject, config }) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      resolve(api(config));
    } else {
      reject(new Error("Session expired. Please log in again."));
    }
  });
  pendingQueue = [];
}

// On a 401, try once to refresh the access token using the refresh token.
// If that also fails, clear the session and force a redirect to /login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response || response.status !== 401 || config?._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject, config: { ...config, _retry: true } });
      });
    }

    config._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${baseURL}/auth/refresh-token`, {
        refreshToken
      });
      const newToken = data?.token || data?.accessToken;
      if (!newToken) throw new Error("No token returned from refresh endpoint");

      updateAccessToken(newToken);
      resolveQueue(newToken);
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    } catch (refreshError) {
      resolveQueue(null);
      clearSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

/**
 * Normalizes any Axios error into a short, user-friendly message,
 * preferring the backend's own message when it provides one.
 */
export function extractErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message;

  if (backendMessage) return backendMessage;

  switch (status) {
    case 400:
      return "That request could not be processed. Please check the form.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested item could not be found.";
    case 409:
      return "This conflicts with existing data.";
    case 500:
      return "The server ran into a problem. Please try again shortly.";
    default:
      return error?.message || fallback;
  }
}

export default api;

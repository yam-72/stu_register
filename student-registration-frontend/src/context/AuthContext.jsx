import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/authApi";
import {
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setSession,
  clearSession
} from "../utils/auth";
import { extractErrorMessage } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  // On first mount, trust whatever is already in storage. Real validation
  // happens naturally the moment a protected API call is made.
  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const { data } = await authApi.login(credentials);
      const token = data?.token;
      const refreshToken = data?.refreshToken;
      const loggedInUser = data?.user;
      if (!token || !loggedInUser) {
        throw new Error("Unexpected response from the server.");
      }
      setSession({ token, refreshToken, user: loggedInUser });
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (error) {
      return { success: false, message: extractErrorMessage(error, "Unable to log in. Check your credentials.") };
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const { data } = await authApi.register(payload);
      return { success: true, data };
    } catch (error) {
      return { success: false, message: extractErrorMessage(error, "Unable to create your account.") };
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // Ignore network errors on logout — we clear the local session regardless.
    } finally {
      clearSession();
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      await authApi.forgotPassword(email);
      return { success: true };
    } catch (error) {
      return { success: false, message: extractErrorMessage(error, "Unable to send reset instructions.") };
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    try {
      await authApi.resetPassword(token, password);
      return { success: true };
    } catch (error) {
      return { success: false, message: extractErrorMessage(error, "Unable to reset your password.") };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await authApi.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, message: extractErrorMessage(error, "Unable to change your password.") };
    }
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user && getAccessToken()),
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService, { setupAxiosInterceptors } from "./authService";
import {
  getToken,
  getUser,
  setUser as setSessionUser,
  removeUser,
  setToken,
  getTokenRemainingMs,
} from "./tokenUtils";
import api from "../../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getToken() ? getUser() : null);
  const [loading, setLoading] = useState(!!getToken() && !getUser());
  const [selectedOrganization, setSelectedOrganization] = useState(
    localStorage.getItem("selectedOrganization") || "",
  );
  const refreshTimerRef = useRef(null);
  const navigate = useNavigate();

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const syncTokenRefresh = async () => {
    const token = getToken();
    if (!token) {
      clearRefreshTimer();
      return;
    }

    const remainingMs = getTokenRemainingMs(token);
    if (remainingMs === null) {
      clearRefreshTimer();
      return;
    }

    clearRefreshTimer();

    const refreshDelay = Math.max(remainingMs - 60000, 0);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const newToken = await authService.refreshToken();
        if (newToken) {
          setToken(newToken);
          await syncTokenRefresh();
        }
      } catch (error) {
        console.error("Automatic token refresh failed", error);
        clearRefreshTimer();
        removeUser();
        setUser(null);
        navigate("/login", { replace: true });
      }
    }, refreshDelay);
  };

  const selectOrganization = (organizationId) => {
    setSelectedOrganization(organizationId);
    if (organizationId) {
      localStorage.setItem("selectedOrganization", organizationId);
    } else {
      localStorage.removeItem("selectedOrganization");
    }
    window.location.reload();
  };

  useEffect(() => {
    // Setup interceptors with navigation capability
    const { requestInterceptor, responseInterceptor } =
      setupAxiosInterceptors(navigate);

    // Check for existing token and load user
    const initAuth = async () => {
      const token = getToken();
      const cachedUser = getUser();
      
      if (!token) {
        removeUser();
        setUser(null);
      } else if (!cachedUser) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          setSessionUser(userData);
        } catch (error) {
          console.error("Failed to fetch user", error);
          removeUser();
          setUser(null);
        }
      }

      if (token) {
        await syncTokenRefresh();
      } else {
        clearRefreshTimer();
      }

      setLoading(false);
    };

    initAuth();

    return () => {
      clearRefreshTimer();
      if (
        requestInterceptor !== undefined &&
        api.interceptors.request.handlers[requestInterceptor]
      ) {
        api.interceptors.request.eject(requestInterceptor);
      }
      if (
        responseInterceptor !== undefined &&
        api.interceptors.response.handlers[responseInterceptor]
      ) {
        api.interceptors.response.eject(responseInterceptor);
      }
    };
  }, [navigate]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data);
    setSessionUser(data);
    await syncTokenRefresh();
    navigate("/"); // Redirect to dashboard
  };

  const logout = async () => {
    clearRefreshTimer();
    await authService.logout();
    setUser(null);
    removeUser();
    navigate("/login");
  };

  const authValue = React.useMemo(() => ({
    user,
    login,
    logout,
    changePassword: authService.changePassword,
    loading,
    isAuthenticated: !!user,
    selectedOrganization,
    selectOrganization,
  }), [user, loading, selectedOrganization]);

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

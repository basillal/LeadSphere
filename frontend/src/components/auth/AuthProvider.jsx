import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import authService, { setupAxiosInterceptors } from "./authService";
import { getToken, getUser, setUser as setSessionUser, removeUser } from "./tokenUtils";
import api from "../../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getToken() ? getUser() : null);
  const [loading, setLoading] = useState(!!getToken() && !getUser());
  const [selectedOrganization, setSelectedOrganization] = useState(
    localStorage.getItem("selectedOrganization") || "",
  );
  const navigate = useNavigate();

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
      setLoading(false);
    };

    initAuth();

    return () => {
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
    navigate("/"); // Redirect to dashboard
  };

  const logout = async () => {
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

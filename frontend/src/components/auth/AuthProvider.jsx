import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService, { setupAxiosInterceptors } from "./authService";
import { getToken } from "./tokenUtils";
import api from "../../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(
    localStorage.getItem("selectedCompany") || "",
  );
  const navigate = useNavigate();

  const selectCompany = (companyId) => {
    setSelectedCompany(companyId);
    if (companyId) {
      localStorage.setItem("selectedCompany", companyId);
    } else {
      localStorage.removeItem("selectedCompany");
    }
    // Force reload/refresh context?
    // Usually React state update triggers re-render, and subsequent API calls will use new ID via interceptor (if configured).
    // We might need to refresh CURRENT page data.
    // Best way: navigate(0) or let the user navigate?
    // Let's just update state. The interceptor will pick it up on next request.
    // Ideally, we trigger a global refresh or the Header switcher triggers a data refetch.
    // For now, state update is enough.
    // If we want immediate effect on current view, simple page reload `window.location.reload()` is often easiest for global context switch.
    window.location.reload();
  };

  useEffect(() => {
    // Setup interceptors with navigation capability
    const { requestInterceptor, responseInterceptor } =
      setupAxiosInterceptors(navigate);

    // Check for existing token and load user
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          // Token invalid or expired, clear it
          console.error("Failed to fetch user", error);
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
    navigate("/"); // Redirect to dashboard
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        selectedCompany,
        selectCompany,
      }}
    >
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

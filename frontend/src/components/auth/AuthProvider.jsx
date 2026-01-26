import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService, { setupAxiosInterceptors } from "./authService";
import { getToken } from "./tokenUtils";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup interceptors with navigation capability
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
      value={{ user, login, logout, loading, isAuthenticated: !!user }}
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

import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/common/Loader";

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const location = useLocation();

  // Safety reset on route change to login
  useEffect(() => {
    if (location.pathname === "/login") {
      setRequestCount(0);
      setLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use(
      (config) => {
        if (!config.skipLoader) {
          setRequestCount((prev) => prev + 1);
          setLoading(true);
        }
        return config;
      },
      (error) => {
        if (!error?.config?.skipLoader) {
          setRequestCount((prev) => Math.max(0, prev - 1));
        }
        return Promise.reject(error);
      },
    );

    const resInterceptor = api.interceptors.response.use(
      (response) => {
        if (!response.config?.skipLoader) {
          setRequestCount((prev) => Math.max(0, prev - 1));
        }
        return response;
      },
      (error) => {
        if (!error?.config?.skipLoader) {
          setRequestCount((prev) => Math.max(0, prev - 1));
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, []);

  // Sync loading state with requestCount
  useEffect(() => {
    if (requestCount > 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [requestCount]);

  return (
    <LoadingContext.Provider value={{ loading, setLoading, setRequestCount }}>
      {loading && <Loader />}
      {children}
    </LoadingContext.Provider>
  );
};

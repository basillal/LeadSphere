import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import Loader from "../components/common/Loader";

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use(
      (config) => {
        // You can conditionally skip loader using config.skipLoader = true
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
        // If count hits 0, hide loader
        // Note: state updates in error/response might race if not careful,
        // but checking setRequestCount callback is safer.
        // Actually, cleaner logging:
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
      // Small debounce could be added here to prevent flickering
      setLoading(false);
    }
  }, [requestCount]);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading && <Loader />}
      {children}
    </LoadingContext.Provider>
  );
};

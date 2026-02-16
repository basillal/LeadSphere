import axios from 'axios';
import { getToken } from '../components/auth/tokenUtils';

// Create axios instance
// Determine baseURL
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || '/api';
  // If it's a full URL (prod) and doesn't end with /api, append it
  if (url !== '/api' && !url.endsWith('/api')) {
    url = `${url.replace(/\/$/, '')}/api`;
  }
  return url;
};

const api = axios.create({
    baseURL: getBaseUrl(), // Use env var or fallback to proxy
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach Token & Context
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Organization Context Injection
        const selectedOrganization = localStorage.getItem('selectedOrganization');
        if (selectedOrganization) {
            config.headers['x-organization-context'] = selectedOrganization;
            
            // Keep query param for backward compatibility or direct GET filters
            if (!config.params) {
                config.params = {};
            }
            config.params.organization = selectedOrganization;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

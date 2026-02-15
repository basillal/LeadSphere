import axios from 'axios';
import { getToken } from '../components/auth/tokenUtils';

// Create axios instance
const api = axios.create({
    // If VITE_API_URL is set, append /api to it (unless it already has it), otherwise default to /api for proxy
    baseURL: import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
        : '/api',
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

        // Company Context Injection
        const selectedCompany = localStorage.getItem('selectedCompany');
        if (selectedCompany) {
            config.headers['x-company-context'] = selectedCompany;
            
            // Keep query param for backward compatibility or direct GET filters
            if (!config.params) {
                config.params = {};
            }
            config.params.company = selectedCompany;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

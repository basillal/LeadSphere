import axios from 'axios';
import { getToken } from '../components/auth/tokenUtils';

// Global request cache to prevent redundant/simultaneous calls
const pendingRequests = new Map();
const resultCache = new Map();
const CACHE_TTL = 800; // 800ms cache to merge StrictMode/simultaneous component loads

// Create axios instance
const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || '/api';
    if (url !== '/api' && !url.endsWith('/api')) {
        url = `${url.replace(/\/$/, '')}/api`;
    }
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 30000,
    withCredentials: true,
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

        const selectedOrganization = localStorage.getItem('selectedOrganization');
        if (selectedOrganization) {
            config.headers['x-organization-context'] = selectedOrganization;
            if (!config.params) config.params = {};
            config.params.organization = selectedOrganization;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Basic error handling if needed
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

// Override the request method to handle simultaneous promise tracking synchronously
const originalRequest = api.request;
api.request = function(config) {
    // Basic normalization of config for GET requests
    if (config.method?.toLowerCase() === 'get' || (!config.method && config.url)) {
        const method = config.method?.toLowerCase() || 'get';
        
        // We need to simulate what the interceptor will do to compute a stable cache key
        const params = { ...(config.params || {}) };
        const selectedOrganization = localStorage.getItem('selectedOrganization');
        if (selectedOrganization && !params.organization) {
            params.organization = selectedOrganization;
        }
        
        const cacheKey = `${method}:${config.url}:${JSON.stringify(params)}`;
        const now = Date.now();

        // 1. Check for a very recent identical response
        const cachedValue = resultCache.get(cacheKey);
        if (cachedValue && (now - cachedValue.timestamp < CACHE_TTL)) {
            return Promise.resolve({
                data: cachedValue.data,
                status: 200,
                statusText: 'OK (from global cache)',
                headers: {},
                config: { ...config, url: config.url, method }
            });
        }

        // 2. Check for an active identical request
        if (pendingRequests.has(cacheKey)) {
            return pendingRequests.get(cacheKey);
        }

        // 3. Fire the request and track it immediately
        const requestPromise = originalRequest.call(this, config).then(response => {
            // Success: Store for next callers (TTL cache)
            resultCache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
            pendingRequests.delete(cacheKey);
            return response;
        }).catch(error => {
            // Error: Don't cache error, just cleanup pending
            pendingRequests.delete(cacheKey);
            throw error;
        });
        
        pendingRequests.set(cacheKey, requestPromise);
        return requestPromise;
    }
    
    return originalRequest.call(this, config);
};

export default api;

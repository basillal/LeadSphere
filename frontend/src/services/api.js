import axios from 'axios';
import { getToken } from '../components/auth/tokenUtils';

// Global request cache to prevent redundant/simultaneous calls
const pendingRequests = new Map();
const resultCache = new Map();
const CACHE_TTL = 5000; // Long enough to cover StrictMode/remount bursts

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const stableSerialize = (value) => {
    if (value === null || value === undefined) {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
    }

    if (isPlainObject(value)) {
        return `{${Object.keys(value)
            .sort()
            .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
            .join(',')}}`;
    }

    return JSON.stringify(value);
};

const mergeUrlParams = (url) => {
    if (!url) {
        return { path: '', params: {} };
    }

    try {
        const parsedUrl = new URL(url, 'http://localhost');
        const params = {};

        parsedUrl.searchParams.forEach((value, key) => {
            if (params[key] === undefined) {
                params[key] = value;
                return;
            }

            if (Array.isArray(params[key])) {
                params[key] = [...params[key], value];
                return;
            }

            params[key] = [params[key], value];
        });

        return { path: parsedUrl.pathname, params };
    } catch {
        const [path, query = ''] = String(url).split('?');
        const params = {};

        new URLSearchParams(query).forEach((value, key) => {
            if (params[key] === undefined) {
                params[key] = value;
                return;
            }

            if (Array.isArray(params[key])) {
                params[key] = [...params[key], value];
                return;
            }

            params[key] = [params[key], value];
        });

        return { path, params };
    }
};

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

const originalRequest = api.request;
const originalGet = api.get;

const buildGetCacheKey = (url, config = {}) => {
    const { path, params: urlParams } = mergeUrlParams(url);
    const params = { ...urlParams, ...(config.params || {}) };

    const selectedOrganization = localStorage.getItem('selectedOrganization');
    if (selectedOrganization && params.organization === undefined) {
        params.organization = selectedOrganization;
    }

    return `get:${path}:${stableSerialize(params)}`;
};

api.get = function(url, config = {}) {
    if (config.skipCache) {
        return originalGet.call(this, url, config);
    }

    const cacheKey = buildGetCacheKey(url, config);
    const now = Date.now();

    const cachedValue = resultCache.get(cacheKey);
    if (cachedValue && (now - cachedValue.timestamp < CACHE_TTL)) {
        return Promise.resolve({
            data: cachedValue.data,
            status: 200,
            statusText: 'OK (from global cache)',
            headers: {},
            config: { ...config, url, method: 'get' }
        });
    }

    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
    }

    const requestPromise = originalGet.call(this, url, config).then((response) => {
        resultCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
        });
        pendingRequests.delete(cacheKey);
        return response;
    }).catch((error) => {
        pendingRequests.delete(cacheKey);
        throw error;
    });

    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
};

api.request = function(config) {
    if (config.method?.toLowerCase() === 'get' || (!config.method && config.url)) {
        return originalRequest.call(this, config);
    }

    // Any mutation should invalidate the short-lived GET cache so subsequent reads refresh.
    resultCache.clear();
    pendingRequests.clear();

    return originalRequest.call(this, config);
};

export default api;

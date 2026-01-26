import api from '../../services/api';
import { getToken, setToken, removeToken } from './tokenUtils';

const API_URL = '/api/auth';

// Login User
const login = async (email, password) => {
    const response = await api.post(`${API_URL}/login`, { email, password });
    if (response.data.accessToken) {
        setToken(response.data.accessToken);
    }
    return response.data;
};

// Logout User
const logout = async () => {
    try {
        await api.post(`${API_URL}/logout`);
    } catch (error) {
        console.error('Logout failed', error);
    }
    removeToken();
    window.location.href = '/login';
};

// Get Current User (Me)
const getMe = async () => {
    const response = await api.get(`${API_URL}/me`);
    return response.data;
};

// Refresh Token
const refreshToken = async () => {
    try {
        const response = await api.post(`${API_URL}/refresh`, {}, { skipLoader: true }); 
        // Note: skipLoader optional if we don't want loader during background refresh
        // But for now let's keep it visible so user knows if something is happening, 
        // OR add skipLoader support in api.js interceptor if we want.
        // My LoadingProvider supports config.skipLoader.
        if (response.data.accessToken) {
            setToken(response.data.accessToken);
            return response.data.accessToken;
        }
    } catch (error) {
        console.error('Refresh token failed', error);
        throw error;
    }
};

// Setup Axios Interceptors
export const setupAxiosInterceptors = (navigate) => {
    // Request Interceptor: Attach Token
    api.interceptors.request.use(
        (config) => {
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle 401
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // If 401 and not retried yet, and NOT the refresh endpoint itself
            if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/refresh')) {
                originalRequest._retry = true;

                try {
                    const newToken = await refreshToken();
                    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    removeToken();
                    if (navigate) navigate('/login');
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};

const authService = {
    login,
    logout,
    getMe,
    refreshToken
};

export default authService;

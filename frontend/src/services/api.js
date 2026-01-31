import axios from 'axios';

// Create axios instance
const api = axios.create({
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json'
    }
});

// Initial Token Injection (in case interceptor is late)
const token = localStorage.getItem('accessToken');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;

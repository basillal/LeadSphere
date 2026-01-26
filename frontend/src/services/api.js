import axios from 'axios';

// Create axios instance
const api = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/referrers';

const referrerService = {
    // Get all referrers with optional filters
    getReferrers: async (params = {}) => {
        const response = await axios.get(API_URL, { params });
        return response.data;
    },

    // Get single referrer by ID
    getReferrerById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },

    // Create new referrer
    createReferrer: async (data) => {
        const response = await axios.post(API_URL, data);
        return response.data;
    },

    // Update referrer
    updateReferrer: async (id, data) => {
        const response = await axios.put(`${API_URL}/${id}`, data);
        return response.data;
    },

    // Delete referrer (soft delete)
    deleteReferrer: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    },

    // Get all referrer statistics
    getReferrerStats: async () => {
        const response = await axios.get(`${API_URL}/stats`);
        return response.data;
    },

    // Get stats for specific referrer
    getReferrerStatsById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}/stats`);
        return response.data;
    },

    // Get all leads for a specific referrer
    getReferrerLeads: async (id, params = {}) => {
        const response = await axios.get(`${API_URL}/${id}/leads`, { params });
        return response.data;
    }
};

export default referrerService;

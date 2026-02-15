import api from './api';

const API_URL = '/referrers';

// Create referrer
const createReferrer = async (referrerData) => {
    const response = await api.post(API_URL, referrerData);
    return response.data;
};

// Get all referrers
const getReferrers = async (params = {}) => {
    const response = await api.get(API_URL, { params });
    return response.data;
};

// Get single referrer
const getReferrer = async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
};

// Update referrer
const updateReferrer = async (id, referrerData) => {
    const response = await api.put(`${API_URL}/${id}`, referrerData);
    return response.data;
};

// Delete referrer
const deleteReferrer = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};

// Get stats for specific referrer
const getReferrerStatsById = async (id) => {
    const response = await api.get(`${API_URL}/${id}/stats`);
    return response.data;
};

// Get general stats for all referrers
const getReferrerStats = async () => {
    const response = await api.get(`${API_URL}/stats`);
    return response.data;
};

// Get all leads for a specific referrer
const getReferrerLeads = async (id, params = {}) => {
    const response = await api.get(`${API_URL}/${id}/leads`, { params });
    return response.data;
};

const referrerService = {
    createReferrer,
    getReferrers,
    getReferrer,
    updateReferrer,
    deleteReferrer,
    getReferrerStats,
    getReferrerStatsById,
    getReferrerLeads
};

export default referrerService;

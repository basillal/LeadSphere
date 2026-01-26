import api from './api';

const API_URL = '/api/followups';

// Create new follow-up
const createFollowUp = async (followUpData) => {
    const response = await api.post(API_URL, followUpData);
    return response.data;
};

// Get today's followups
const getTodayFollowUps = async () => {
    const response = await api.get(`${API_URL}/today`);
    return response.data;
};

// Get upcoming followups
const getUpcomingFollowUps = async () => {
    const response = await api.get(`${API_URL}/upcoming`);
    return response.data;
};

// Get missed followups
const getMissedFollowUps = async () => {
    const response = await api.get(`${API_URL}/missed`);
    return response.data;
};

// Get all followups (with filters)
const getFollowUps = async (params) => {
    const response = await api.get(API_URL, { params });
    return response.data;
};

// Update follow-up
const updateFollowUp = async (id, followUpData) => {
    const response = await api.put(`${API_URL}/${id}`, followUpData);
    return response.data;
};

// Delete follow-up
const deleteFollowUp = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};

// Get follow-ups for a specific lead
const getLeadFollowUps = async (leadId) => {
    const response = await api.get(`${API_URL}/lead/${leadId}`);
    return response.data;
};

const followUpService = {
    createFollowUp,
    getFollowUps,
    updateFollowUp,
    deleteFollowUp,
    getLeadFollowUps
};

export default followUpService;

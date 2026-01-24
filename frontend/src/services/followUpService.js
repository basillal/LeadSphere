import axios from 'axios';

const API_URL = '/api/follow-ups';

// Create new follow-up
const createFollowUp = async (followUpData) => {
    const response = await axios.post(API_URL, followUpData);
    return response.data;
};

// Get all follow-ups (supports filtering by range)
const getFollowUps = async (params) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
};

// Update follow-up
const updateFollowUp = async (id, followUpData) => {
    const response = await axios.put(`${API_URL}/${id}`, followUpData);
    return response.data;
};

// Delete follow-up
const deleteFollowUp = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

// Get follow-ups for a specific lead
const getLeadFollowUps = async (leadId) => {
    const response = await axios.get(`${API_URL}/lead/${leadId}`);
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

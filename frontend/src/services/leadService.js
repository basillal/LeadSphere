import axios from 'axios';

const API_URL = '/api/leads'; // Relative path to use Vite proxy

// Create new lead
const createLead = async (leadData) => {
    const response = await axios.post(API_URL, leadData);
    return response.data;
};

// Get all leads
const getLeads = async (params) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
};

// Get single lead
const getLead = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// Update lead
const updateLead = async (id, leadData) => {
    const response = await axios.put(`${API_URL}/${id}`, leadData);
    return response.data;
};

// Delete lead
const deleteLead = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

const leadService = {
    createLead,
    getLeads,
    getLead,
    updateLead,
    deleteLead
};

export default leadService;

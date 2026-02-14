import api from './api';

const API_URL = '/api/contacts'; // Relative path to use Vite proxy

// Create new contact
const createContact = async (contactData) => {
    const response = await api.post(API_URL, contactData);
    return response.data;
};

// Convert lead to contact
const convertLeadToContact = async (leadId, additionalData = {}) => {
    const response = await api.post(`${API_URL}/convert/${leadId}`, additionalData);
    return response.data;
};

// Get all contacts
const getContacts = async (params) => {
    const response = await api.get(API_URL, { params });
    return response.data;
};

// Get contact statistics
const getContactStats = async () => {
    const response = await api.get(`${API_URL}/stats`);
    return response.data;
};

// Get single contact
const getContact = async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
};

// Update contact
const updateContact = async (id, contactData) => {
    const response = await api.put(`${API_URL}/${id}`, contactData);
    return response.data;
};

// Delete contact
const deleteContact = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};

const contactService = {
    createContact,
    convertLeadToContact,
    getContacts,
    getContactStats,
    getContact,
    updateContact,
    deleteContact
};

export default contactService;

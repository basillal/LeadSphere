import api from './api';

const API_URL = '/organizations';

const getOrganizations = async (params) => {
    const response = await api.get(API_URL, { params });
    return response.data;
};

const getOrganization = async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
};

const createOrganization = async (organizationData) => {
    const response = await api.post(API_URL, organizationData);
    return response.data;
};

const updateOrganization = async (id, organizationData) => {
    const response = await api.put(`${API_URL}/${id}`, organizationData);
    return response.data;
};

const deleteOrganization = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};

const organizationService = {
    getOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization
};

export default organizationService;

import api from './api';

const API_URL = '/api/companies';

const getCompanies = async (params) => {
    const response = await api.get(API_URL, { params });
    return response.data;
};

const getCompany = async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
};

const createCompany = async (companyData) => {
    const response = await api.post(API_URL, companyData);
    return response.data;
};

const updateCompany = async (id, companyData) => {
    const response = await api.put(`${API_URL}/${id}`, companyData);
    return response.data;
};

const deleteCompany = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};

const companyService = {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany
};

export default companyService;

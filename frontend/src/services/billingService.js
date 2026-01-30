import api from './api';

const API_URL = '/api/billings';

const createBilling = async (billingData) => {
    const response = await api.post(API_URL, billingData);
    return response.data;
};

const getBillings = async (params) => {
    const response = await api.get(API_URL, { params });
    return response.data;
};

const getBilling = async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
};

const updateBilling = async (id, billingData) => {
    const response = await api.put(`${API_URL}/${id}`, billingData);
    return response.data;
};

const deleteBilling = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};

const billingService = {
    createBilling,
    getBillings,
    getBilling,
    updateBilling,
    deleteBilling
};

export default billingService;

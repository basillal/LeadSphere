import api from './api';

const API_URL = '/api/reports';

const getServiceRevenue = async (params) => {
    const response = await api.get(`${API_URL}/service-revenue`, { params });
    return response.data;
};

const getMonthlyTransactions = async (params) => {
    const response = await api.get(`${API_URL}/monthly`, { params });
    return response.data;
};

const getPaymentStatusStats = async (params) => {
    const response = await api.get(`${API_URL}/payment-status`, { params });
    return response.data;
};

const getContactBilling = async (params) => {
    const response = await api.get(`${API_URL}/contact-billing`, { params });
    return response.data;
};

const reportService = {
    getServiceRevenue,
    getMonthlyTransactions,
    getPaymentStatusStats,
    getContactBilling
};

export default reportService;

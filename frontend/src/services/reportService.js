import api from './api';

const API_URL = '/api/reports';

const getServiceRevenue = async () => {
    const response = await api.get(`${API_URL}/service-revenue`);
    return response.data;
};

const getMonthlyTransactions = async (year) => {
    const response = await api.get(`${API_URL}/monthly`, { params: { year } });
    return response.data;
};

const getPaymentStatusStats = async () => {
    const response = await api.get(`${API_URL}/payment-status`);
    return response.data;
};

const getContactBilling = async () => {
    const response = await api.get(`${API_URL}/contact-billing`);
    return response.data;
};

const reportService = {
    getServiceRevenue,
    getMonthlyTransactions,
    getPaymentStatusStats,
    getContactBilling
};

export default reportService;

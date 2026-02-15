import api from './api';

const API_URL = '/services';

const createService = async (serviceData) => {
    const response = await api.post(API_URL, serviceData);
    return response.data;
};

const getServices = async (params) => {
    const response = await api.get(API_URL, { params });
    return response.data;
};

const getService = async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
};

const updateService = async (id, serviceData) => {
    const response = await api.put(`${API_URL}/${id}`, serviceData);
    return response.data;
};

const deleteService = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};

const serviceService = {
    createService,
    getServices,
    getService,
    updateService,
    deleteService
};

export default serviceService;

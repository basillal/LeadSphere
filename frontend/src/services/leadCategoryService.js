import api from './api';

const API_URL = '/lead-categories';

const getCategories = async () => {
    const response = await api.get(API_URL);
    return response.data;
};

const createCategory = async (categoryData) => {
    const response = await api.post(API_URL, categoryData);
    return response.data;
};

const updateCategory = async (id, categoryData) => {
    const response = await api.put(`${API_URL}/${id}`, categoryData);
    return response.data;
};

const deleteCategory = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};

const leadCategoryService = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};

export default leadCategoryService;

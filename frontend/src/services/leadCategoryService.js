import api from './api';

const API_URL = '/lead-categories';

let categoriesCache = null;

const getCategories = async (forceRefresh = false) => {
    if (categoriesCache && !forceRefresh) {
        return categoriesCache;
    }
    const response = await api.get(API_URL);
    categoriesCache = response.data;
    return response.data;
};

const createCategory = async (categoryData) => {
    const response = await api.post(API_URL, categoryData);
    categoriesCache = null; // Invalidate cache
    return response.data;
};

const updateCategory = async (id, categoryData) => {
    const response = await api.put(`${API_URL}/${id}`, categoryData);
    categoriesCache = null; // Invalidate cache
    return response.data;
};

const deleteCategory = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    categoriesCache = null; // Invalidate cache
    return response.data;
};

const leadCategoryService = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};

export default leadCategoryService;

import axios from 'axios';

const API_URL = '/api/users';

const getUsers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getUser = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

const createUser = async (userData) => {
    const response = await axios.post(API_URL, userData);
    return response.data;
};

const updateUser = async (id, userData) => {
    const response = await axios.put(`${API_URL}/${id}`, userData);
    return response.data;
};

const deleteUser = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

const resetPassword = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/reset-password`);
    return response.data;
};

const userService = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword
};

export default userService;

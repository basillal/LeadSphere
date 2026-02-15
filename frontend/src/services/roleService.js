import api from './api';

const API_URL = '/roles';
const PERMISSION_API_URL = '/permissions';

// Roles
const getRoles = async () => {
    const response = await api.get(API_URL);
    return response.data;
};

const getRole = async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
};

const createRole = async (roleData) => {
    const response = await api.post(API_URL, roleData);
    return response.data;
};

const updateRole = async (id, roleData) => {
    const response = await api.put(`${API_URL}/${id}`, roleData);
    return response.data;
};

const deleteRole = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};

// Permissions
const getPermissions = async () => {
    const response = await api.get(PERMISSION_API_URL);
    return response.data;
};

const getGroupedPermissions = async () => {
    const response = await api.get(`${PERMISSION_API_URL}/grouped`);
    return response.data;
};

const roleService = {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    getGroupedPermissions
};

export default roleService;

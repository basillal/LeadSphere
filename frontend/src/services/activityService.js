import api from './api';

const API_URL = '/activities';

// Create new activity
const createActivity = async (activityData) => {
    const response = await api.post(API_URL, activityData);
    return response.data;
};

// Get all activities with filters
const getActivities = async (params = {}) => {
    const response = await api.get(API_URL, { params });
    return response.data;
};

// Get single activity
const getActivity = async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
};

// Update activity
const updateActivity = async (id, activityData) => {
    const response = await api.put(`${API_URL}/${id}`, activityData);
    return response.data;
};

// Delete activity
const deleteActivity = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
};

// Get activities by related contact/lead
const getActivitiesByRelated = async (relatedTo, relatedId) => {
    const response = await api.get(`${API_URL}/related/${relatedTo}/${relatedId}`);
    return response.data;
};

// Get activity statistics
const getActivityStats = async () => {
    const response = await api.get(`${API_URL}/stats`);
    return response.data;
};

const activityService = {
    createActivity,
    getActivities,
    getActivity,
    updateActivity,
    deleteActivity,
    getActivitiesByRelated,
    getActivityStats
};

export default activityService;

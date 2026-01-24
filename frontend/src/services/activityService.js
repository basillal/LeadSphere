import axios from 'axios';

const API_URL = 'http://localhost:3000/api/activities';

const activityService = {
    // Get all activities with filters
    getActivities: async (params = {}) => {
        const response = await axios.get(API_URL, { params });
        return response.data;
    },

    // Get single activity
    getActivity: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },

    // Create new activity
    createActivity: async (activityData) => {
        const response = await axios.post(API_URL, activityData);
        return response.data;
    },

    // Update activity
    updateActivity: async (id, activityData) => {
        const response = await axios.put(`${API_URL}/${id}`, activityData);
        return response.data;
    },

    // Delete activity
    deleteActivity: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    },

    // Get activities by related contact/lead
    getActivitiesByRelated: async (relatedTo, relatedId) => {
        const response = await axios.get(`${API_URL}/related/${relatedTo}/${relatedId}`);
        return response.data;
    },

    // Get activity statistics
    getActivityStats: async () => {
        const response = await axios.get(`${API_URL}/stats`);
        return response.data;
    }
};

export default activityService;

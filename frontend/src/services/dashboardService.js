import api from './api';

const dashboardService = {
  getStats: async (params = {}) => {
    try {
        // Convert to query string
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/api/dashboard?${queryString}`);
        return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default dashboardService;

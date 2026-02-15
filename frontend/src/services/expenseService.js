import api from "./api";

const API_URL = '/expenses';

const expenseService = {
  getExpenses: (params) => api.get(API_URL, { params }),
  getExpense: (id) => api.get(`${API_URL}/${id}`),
  createExpense: (data) => api.post(API_URL, data),
  updateExpense: (id, data) => api.put(`${API_URL}/${id}`, data),
  deleteExpense: (id) => api.delete(`${API_URL}/${id}`),
};

export default expenseService;

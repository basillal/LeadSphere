import api from './api';

const getAuditLogs = async (params, config = {}) => {
  const response = await api.get('/audit-logs', { params, ...config });
  return response.data;
};

const auditLogService = {
  getAuditLogs
};

export default auditLogService;

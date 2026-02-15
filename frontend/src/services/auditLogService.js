import api from './api';

const getAuditLogs = async (params) => {
  const response = await api.get('/audit-logs', { params });
  return response.data;
};

const auditLogService = {
  getAuditLogs
};

export default auditLogService;

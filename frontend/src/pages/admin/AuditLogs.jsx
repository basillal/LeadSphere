import { useState, useEffect } from "react";
import auditLogService from "../../services/auditLogService";
import AuditLogsTable from "./AuditLogsTable";
import Toast from "../../components/common/utils/Toast";
import RefreshIcon from "@mui/icons-material/Refresh";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  // Filters could be expanded (Action, Entity, User Search)
  // For now simple refresh

  const [filters, setFilters] = useState({
    action: "",
    entity: "",
    userId: "",
    companyId: "", // Useful for super admin later
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditLogService.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        ...filters, // Pass filters to service
      });
      setLogs(res.data || []);
      setPagination((prev) => ({
        ...prev,
        total: res.pagination?.total || 0,
        pages: res.pagination?.pages || 1,
      }));
    } catch (err) {
      showSnackbar("Failed to fetch audit logs", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500">
            Track system activity and security events
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshIcon fontSize="small" />
          Refresh
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 text-sm font-medium uppercase tracking-wide">
              Total Log Entries
            </span>
            <div className="text-indigo-700 opacity-80">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-indigo-700">
            {pagination.total}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 text-sm font-medium uppercase tracking-wide">
              Security Events
            </span>
            <div className="text-purple-700 opacity-80">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-700">Protected</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 text-sm font-medium uppercase tracking-wide">
              System Status
            </span>
            <div className="text-emerald-700 opacity-80">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-700">Active</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-gray-700">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <h3 className="font-semibold">Filter Logs</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">ACT</span>
            </div>
            <input
              type="text"
              placeholder="Action (e.g. CREATE)"
              className="pl-12 border border-gray-200 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              value={filters.action}
              onChange={(e) =>
                setFilters({ ...filters, action: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">ENT</span>
            </div>
            <input
              type="text"
              placeholder="Entity (e.g. User)"
              className="pl-12 border border-gray-200 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              value={filters.entity}
              onChange={(e) =>
                setFilters({ ...filters, entity: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">UID</span>
            </div>
            <input
              type="text"
              placeholder="User ID"
              className="pl-12 border border-gray-200 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              value={filters.userId}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value })
              }
            />
          </div>

          <button
            onClick={() => setPagination({ ...pagination, page: 1 })}
            className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 font-medium flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <AuditLogsTable rows={logs} />
          </div>

          {/* Simple Pagination Controls */}
          <div className="flex justify-between items-center mt-6 px-2">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span> results
            </div>

            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default AuditLogs;

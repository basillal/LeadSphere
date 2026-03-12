import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import { useLoading } from "../../context/LoadingProvider";
import auditLogService from "../../services/auditLogService";
import organizationService from "../../services/organizationService";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";
import Toast from "../../components/common/utils/Toast";
import RefreshIcon from "@mui/icons-material/Refresh";
import Input from "../../components/common/fields/Input";
import Select from "../../components/common/fields/Select";

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const { loading } = useLoading();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const isSuperAdmin = user?.role?.roleName === "Super Admin";

  // Filters could be expanded (Action, Entity, User Search)
  // For now simple refresh

  const [filters, setFilters] = useState({
    action: "",
    entity: "",
    userId: "",
    organizationId: "", // Useful for super admin later
  });

  const [appliedFilters, setAppliedFilters] = useState({
    action: "",
    entity: "",
    userId: "",
    organizationId: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
    if (isSuperAdmin) {
      fetchOrganizations();
    }
  }, [pagination.page, pagination.limit, appliedFilters]);

  const fetchOrganizations = async () => {
    try {
      const res = await organizationService.getOrganizations({ limit: 100 });
      setOrganizations(res.data || []);
    } catch (err) {
      console.error("Failed to fetch organizations", err);
    }
  };

  const fetchLogs = async () => {
    try {
      // setLoading(true);
      const res = await auditLogService.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        ...appliedFilters, // Pass applied filters to service
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
      // setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatEmailOrIp = (row) => {
    if (row.user?.email) return row.user.email;
    if (!row.ipAddress) return "-";
    if (row.ipAddress === "127.0.0.1" || row.ipAddress === "::1") {
      return "Localhost";
    }
    return row.ipAddress;
  };

  const formatDetails = (details) => {
    if (!details) return "-";
    return details.replace("127.0.0.1", "local machine");
  };

  const filteredLogs = useMemo(() => {
    if (dateFilter === "all") return logs;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const inLastDays = (createdAt, days) => {
      const created = new Date(createdAt);
      const diffMs = now - created;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= days;
    };

    return logs.filter((log) => {
      if (!log.createdAt) return false;
      const created = new Date(log.createdAt);

      switch (dateFilter) {
        case "today":
          return (
            created >= startOfToday &&
            created <= new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
          );
        case "7d":
          return inLastDays(log.createdAt, 7);
        case "30d":
          return inLastDays(log.createdAt, 30);
        default:
          return true;
      }
    });
  }, [logs, dateFilter]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Audit Logs
            </h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
              {filteredLogs.length} logs
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Track system activity and security events
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          title="Refresh logs"
        >
          <RefreshIcon fontSize="small" />
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-gray-700">
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
            <h3 className="font-semibold text-sm md:text-base">Filter logs</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All time" },
              { id: "today", label: "Today" },
              { id: "7d", label: "Last 7 days" },
              { id: "30d", label: "Last 30 days" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDateFilter(opt.id)}
                className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition-colors ${
                  dateFilter === opt.id
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <Input
            label="Action"
            name="action"
            value={filters.action}
            onChange={(e) =>
              setFilters({ ...filters, action: e.target.value })
            }
            placeholder="e.g. CREATE"
          />

          <Input
            label="Entity"
            name="entity"
            value={filters.entity}
            onChange={(e) =>
              setFilters({ ...filters, entity: e.target.value })
            }
            placeholder="e.g. User"
          />

          <Input
            label="User ID"
            name="userId"
            value={filters.userId}
            onChange={(e) =>
              setFilters({ ...filters, userId: e.target.value })
            }
            placeholder="User ID"
          />

          {isSuperAdmin && (
            <Select
              label="Organization"
              name="organizationId"
              value={filters.organizationId}
              onChange={(e) =>
                setFilters({ ...filters, organizationId: e.target.value })
              }
              options={[
                { label: "All organizations", value: "" },
                ...organizations.map((org) => ({
                  label: org.name,
                  value: org._id,
                })),
              ]}
            />
          )}

          <div className="flex items-end">
            <button
              onClick={() => {
                setAppliedFilters(filters);
                setPagination({ ...pagination, page: 1 });
              }}
              className="w-full md:w-auto bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
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
              Apply filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <AdvancedTable
              data={filteredLogs}
              columns={[
                {
                  id: "createdAt",
                  label: "Date / Time",
                  width: "w-1/5",
                  render: (row) => (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(row.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ),
                },
                {
                  id: "user",
                  label: "User",
                  width: "w-1/5",
                  render: (row) => (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {row.user?.name ? row.user.name.toUpperCase() : "UNKNOWN"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatEmailOrIp(row)}
                      </span>
                    </div>
                  ),
                },
                {
                  id: "action",
                  label: "Action",
                  width: "w-1/6",
                  render: (row) => (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      {row.action}
                    </span>
                  ),
                },
                {
                  id: "entity",
                  label: "Entity",
                  width: "w-1/6",
                  render: (row) => row.entity || "-",
                },
                {
                  id: "organization",
                  label: "Organization",
                  width: "w-1/6",
                  render: (row) =>
                    row.organization?.name ||
                    (row.organization
                      ? "Organization ID: " + row.organization
                      : "Global/System"),
                },
                {
                  id: "details",
                  label: "Details",
                  width: "w-1/3",
                  render: (row) => (
                    <span
                      className="text-sm text-gray-700 truncate max-w-xs block"
                      title={row.details}
                    >
                      {formatDetails(row.details)}
                    </span>
                  ),
                },
              ]}
              emptyMessage="No logs found matching your criteria."
              loading={loading}
              getRowId={(row) => row._id}
              pagination={{
                enabled: true,
                external: true,
                page: pagination.page,
                rowsPerPage: pagination.limit,
                total: pagination.total,
                onPageChange: (newPage) =>
                  setPagination((prev) => ({ ...prev, page: newPage })),
                onRowsPerPageChange: (newLimit) =>
                  setPagination((prev) => ({
                    ...prev,
                    page: 1,
                    limit: newLimit,
                    pages: Math.max(
                      1,
                      Math.ceil((prev.total || 0) / newLimit),
                    ),
                  })),
              }}
            />
          </div>

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

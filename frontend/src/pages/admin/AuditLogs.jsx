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
import { formatDate, formatTime } from "../../utils/dateUtils";

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const { loading } = useLoading();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
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
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[13px] font-semibold text-gray-900 tracking-tight">
              Audit Logs
            </h1>
            <span className="inline-flex items-center px-2 py-0.2 rounded-full bg-gray-100 text-gray-700 text-[9.5px] font-semibold border border-gray-200">
              {filteredLogs.length} events
            </span>
          </div>
          <p className="text-[10.5px] text-gray-400 mt-0.5">
            Immutable log of system security events, data manipulations, and user actions.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="em-btn-clear h-[34px] w-[34px] p-0 flex items-center justify-center rounded-full"
          title="Refresh logs"
        >
          <RefreshIcon sx={{ fontSize: 18 }} />
        </button>
      </div>

      {/* Filters Section */}
      <div className="em-card p-3 rounded-[16px] bg-white border border-gray-100 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-gray-700">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
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
            <h3 className="font-semibold text-[11px] text-gray-900">Filter Event Logs</h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
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
                className={`h-[28px] px-3 rounded-full text-[10px] font-semibold border transition-colors ${
                  dateFilter === opt.id
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            label="Action"
            name="action"
            value={filters.action}
            onChange={(e) =>
              setFilters({ ...filters, action: e.target.value })
            }
            placeholder="e.g. CREATE, UPDATE"
          />

          <Input
            label="Entity"
            name="entity"
            value={filters.entity}
            onChange={(e) =>
              setFilters({ ...filters, entity: e.target.value })
            }
            placeholder="e.g. User, Lead"
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

          <div className="flex items-center gap-2 pt-1 md:col-span-4 justify-end">
            <button
              onClick={() => {
                setFilters({ action: "", entity: "", userId: "", organizationId: "" });
                setAppliedFilters({ action: "", entity: "", userId: "", organizationId: "" });
                setPagination({ ...pagination, page: 1 });
              }}
              className="em-btn-clear h-[34px] px-4 text-[11px] font-medium"
            >
              Clear
            </button>
            <button
              onClick={() => {
                setAppliedFilters(filters);
                setPagination({ ...pagination, page: 1 });
              }}
              className="em-add h-[34px] px-5 text-[11px] font-medium inline-flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
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
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="em-card overflow-hidden">
        <AdvancedTable
              data={filteredLogs}
              columns={[
                {
                  id: "createdAt",
                  label: "Date / Time",
                  render: (row) => (
                    <div className="flex flex-col whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-gray-900">
                        {formatDate(row.createdAt)}
                      </span>
                      <span className="text-[9.5px] text-gray-400">
                        {formatTime(row.createdAt)}
                      </span>
                    </div>
                  ),
                },
                {
                  id: "user",
                  label: "User",
                  render: (row) => (
                    <div className="flex flex-col whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-gray-900">
                        {row.user?.name || "SYSTEM"}
                      </span>
                      <span className="text-[9.5px] text-gray-400">
                        {formatEmailOrIp(row)}
                      </span>
                    </div>
                  ),
                },
                {
                  id: "action",
                  label: "Action",
                  render: (row) => (
                    <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                      {row.action}
                    </span>
                  ),
                },
                {
                  id: "entity",
                  label: "Entity",
                  render: (row) => (
                    <span className="text-[10.5px] text-gray-700 font-medium whitespace-nowrap">
                      {row.entity || "-"}
                    </span>
                  ),
                },
                {
                  id: "organization",
                  label: "Organization",
                  render: (row) => (
                    <span className="text-[10.5px] text-gray-500 whitespace-nowrap">
                      {row.organization?.name ||
                        (row.organization
                          ? "Org ID: " + row.organization
                          : "Global/System")}
                    </span>
                  ),
                },
                {
                  id: "details",
                  label: "Details",
                  render: (row) => (
                    <span
                      className="text-[10.5px] text-gray-600 truncate max-w-xs block font-mono"
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

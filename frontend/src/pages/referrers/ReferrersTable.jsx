import React from "react";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";

const ReferrersTable = ({
  referrers,
  onCreate,
  onEdit,
  onDelete,
  onView,
  filters,
  onFilterChange,
  pagination,
  onPageChange,
  onLimitChange,
  referrerStats,
  loading = false,
}) => {
  // Column definitions
  const columns = [
    {
      id: "name",
      label: "Name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 uppercase">
            {row.name}
          </span>
          {row.designation && (
            <span className="text-xs text-gray-500">{row.designation}</span>
          )}
        </div>
      ),
    },
    { id: "phone", label: "Phone" },
    {
      id: "email",
      label: "Email",
      render: (row) => row.email || "-",
    },
    {
      id: "organizationName",
      label: "Referrer Co.",
      render: (row) => row.organizationName || "-",
    },
    {
      id: "createdBy",
      label: "Created by",
      render: (row) => row.createdBy?.name || "System",
    },
    {
      id: "tenant",
      label: "Organization",
      render: (row) => row.organization?.name || "-",
    },
    {
      id: "totalLeads",
      label: "Total leads",
      sortable: false,
      render: (row) => {
        const stats = referrerStats?.[row._id] || {};
        return (
          <span className="font-semibold text-gray-900">
            {stats.totalLeads || 0}
          </span>
        );
      },
    },
    {
      id: "convertedLeads",
      label: "Converted",
      sortable: false,
      render: (row) => {
        const stats = referrerStats?.[row._id] || {};
        return (
          <span className="font-semibold text-gray-900">
            {stats.convertedLeads || 0}
          </span>
        );
      },
    },
    {
      id: "conversionPercentage",
      label: "Conversion %",
      sortable: false,
      render: (row) => {
        const stats = referrerStats?.[row._id] || {};
        return (
          <span className="font-semibold text-gray-900">
            {stats.conversionPercentage || 0}%
          </span>
        );
      },
    },
  ];

  // Actions
  const actions = [
    {
      icon: (
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      label: "View",
      onClick: onView,
      color: "text-gray-600 hover:bg-gray-100",
    },
    {
      icon: (
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      label: "Edit",
      onClick: onEdit,
      color: "text-gray-600 hover:bg-gray-100",
    },
    {
      icon: (
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      label: "Delete",
      onClick: (row) => onDelete(row._id),
      color: "text-red-600 hover:bg-red-50",
    },
  ];

  // Toolbar
  const toolbar = {
    search: {
      value: filters.search,
      onChange: (value) => onFilterChange("search", value),
    },
    searchPlaceholder: "Search referrers...",
    onCreate: {
      label: "Add referrer",
      onClick: onCreate,
    },
  };

  // Custom mobile card
  const renderCard = (row, actions) => {
    const stats = referrerStats?.[row._id] || {};
    return (
      <MobileCard
        title={row.name}
        subtitle={row.organizationName || "-"}
        status={!row.isActive ? "Inactive" : null}
        statusColor="bg-gray-100 text-gray-600"
        onClick={() => onView && onView(row)}
        data={[
          { icon: "📞", value: row.phone, label: "Phone" },
          { icon: "✉️", value: row.email, label: "Email" },
          { icon: "🏢", value: row.organization?.name, label: "Org" },
          { icon: "📊", value: `${stats.totalLeads || 0} Leads (${stats.conversionPercentage || 0}%)`, label: "Stats" },
        ]}
        actions={actions.map((action) => ({
          ...action,
          onClick: () => action.onClick(row),
        }))}
      />
    );
  };

  return (
    <div className="w-full">
      <AdvancedTable
        data={referrers}
        columns={columns}
        actions={actions}
        toolbar={toolbar}
        pagination={{ enabled: false }} // Using external pagination
        renderCard={renderCard}
        emptyMessage="No referrers found"
        loading={loading}
      />

      {/* External pagination for backend pagination */}
      {pagination && referrers.length > 0 && (
        <div className="mt-4 px-4 py-3 glass-effect border border-[rgba(46,111,64,0.25)] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span>{" "}
              referrers
            </div>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center px-4 py-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </div>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferrersTable;

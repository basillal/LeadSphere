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
          <span className="font-semibold text-gray-900 text-[11px]">
            {row.name}
          </span>
          {row.designation && (
            <span className="text-[10px] text-gray-400">{row.designation}</span>
          )}
        </div>
      ),
    },
    { 
      id: "phone", 
      label: "Phone",
      render: (row) => <span className="text-[10.5px] text-gray-700">{row.phone || "-"}</span>
    },
    {
      id: "email",
      label: "Email",
      render: (row) => <span className="text-[10.5px] text-gray-600">{row.email || "-"}</span>,
    },
    {
      id: "organizationName",
      label: "Referrer Co.",
      render: (row) => <span className="text-[10.5px] text-gray-700 font-medium">{row.organizationName || "-"}</span>,
    },
    {
      id: "createdBy",
      label: "Created by",
      render: (row) => <span className="text-[10.5px] text-gray-500">{row.createdBy?.name || "System"}</span>,
    },
    {
      id: "tenant",
      label: "Organization",
      render: (row) => <span className="text-[10.5px] text-gray-500">{row.organization?.name || "-"}</span>,
    },
    {
      id: "totalLeads",
      label: "Total Leads",
      sortable: false,
      render: (row) => {
        const stats = referrerStats?.[row._id] || {};
        return (
          <span className="font-semibold text-gray-800 text-[11px]">
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
          <span className="font-semibold text-emerald-600 text-[11px]">
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
          <span className="font-semibold text-[var(--primary)] text-[11px]">
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
          className="w-3.5 h-3.5"
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
    },
    {
      icon: (
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      label: "Edit",
      onClick: onEdit,
    },
    {
      icon: (
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      label: "Delete",
      onClick: (row) => onDelete(row._id),
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
      label: "Add Referrer",
      onClick: onCreate,
    },
  };

  // Custom mobile card
  const renderCard = (row, actions) => {
    const stats = referrerStats?.[row._id] || {};
    return (
      <div className="bg-white p-3.5 rounded-[16px] border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-[12px]">
              {row.name}
            </h3>
            {row.organizationName && (
              <p className="text-[10px] text-gray-500">{row.organizationName}</p>
            )}
            {row.designation && (
              <p className="text-[9.5px] text-gray-400">{row.designation}</p>
            )}
          </div>
          {!row.isActive && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-semibold rounded-full">
              Inactive
            </span>
          )}
        </div>

        <div className="space-y-1 text-[10.5px] text-gray-600 mb-2.5">
          <p>
            <span className="text-gray-400">Phone:</span> {row.phone}
          </p>
          {row.email && (
            <p>
              <span className="text-gray-400">Email:</span> {row.email}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded-[10px] text-gray-700 mb-2.5 text-[10px]">
          <div>
            <div className="text-gray-400 text-[8.5px] uppercase">Total</div>
            <div className="font-bold text-gray-900 text-[11px]">{stats.totalLeads || 0}</div>
          </div>
          <div>
            <div className="text-gray-400 text-[8.5px] uppercase">Converted</div>
            <div className="font-bold text-emerald-600 text-[11px]">
              {stats.convertedLeads || 0}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-[8.5px] uppercase">Rate</div>
            <div className="font-bold text-[var(--primary)] text-[11px]">
              {stats.conversionPercentage || 0}%
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-1.5 border-t border-gray-100 pt-2">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(row);
              }}
              className="em-icon-btn"
              title={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      </div>
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
        <div className="mt-3 px-4 py-2.5 em-card flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-[10px] text-gray-500 font-medium">
              Showing{" "}
              <span className="font-bold text-gray-800">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-gray-800">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-bold text-gray-800">{pagination.total}</span>{" "}
              referrers
            </div>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-[30px] px-2.5 border border-gray-200 rounded-[8px] text-[10px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="h-[30px] px-3 border border-gray-200 rounded-full text-[10px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="px-2 text-[10px] font-semibold text-gray-500">
              {pagination.page} / {pagination.pages}
            </div>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="h-[30px] px-3 border border-gray-200 rounded-full text-[10px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
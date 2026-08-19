import React from "react";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";

const LeadsTable = ({
  rows = [],
  onEdit,
  onDelete,
  onCreate,
  onPreview,
  filters = { search: "", status: "", source: "" },
  onFilterChange,
  pagination,
  onPageChange,
  onLimitChange,
  loading = false,
  categories = [],
}) => {
  // Helper function for status colors
  const getStatusColor = (status, isConverted) => {
    if (isConverted) {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
    }
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20";
      case "Pending":
        return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20";
      case "In Progress":
        return "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20";
      case "On Hold":
        return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20";
      case "Completed":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
      case "Lost":
        return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20";
    }
  };

  // Column definitions
  const columns = [
    {
      id: "name",
      label: "Lead Details",
      width: "w-1/5",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 ring-1 ring-inset ring-indigo-600/10">
            {row.name ? row.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="text-sm font-semibold text-gray-900 tracking-tight capitalize truncate">{row.name ? row.name.toLowerCase() : "-"}</div>
            <div className="text-xs font-medium text-gray-500 mt-0.5 truncate">{row.email ? row.email.toLowerCase() : "No email"}</div>
          </div>
        </div>
      ),
    },
    {
      id: "organizationName",
      label: "Organization",
      width: "w-[15%]",
      render: (row) => (
        <span className="text-sm font-medium text-gray-700 capitalize">{row.organizationName || "-"}</span>
      ),
    },
    {
      id: "createdBy",
      label: "Created by",
      width: "w-[12%]",
      render: (row) => <span className="text-sm font-medium text-gray-600">{row.createdBy?.name || "System"}</span>,
    },
    {
      id: "tenant",
      label: "Tenant Org.",
      width: "w-[12%]",
      render: (row) => <span className="text-sm font-medium text-gray-600">{row.organization?.name || "-"}</span>,
    },
    { id: "phone", label: "Phone", width: "w-[12%]", render: (row) => <span className="text-sm font-medium text-gray-700">{row.phone || "-"}</span> },
    { 
      id: "source", 
      label: "Source", 
      width: "w-[12%]", 
      render: (row) => (
        row.source ? (
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {row.source}
          </span>
        ) : <span className="text-sm font-medium text-gray-400">-</span>
      ) 
    },
    {
      id: "status",
      label: "Status",
      width: "w-[10%]",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(row.status, row.isConverted)}`}
        >
          {row.isConverted ? "Converted" : row.status}
        </span>
      ),
    },
    { 
      id: "priority", 
      label: "Priority", 
      width: "w-[10%]", 
      render: (row) => {
        if (!row.priority) return <span className="text-sm font-medium text-gray-400">-</span>;
        let colorClass = "bg-gray-50 text-gray-700 ring-gray-600/20";
        if (row.priority === "High") colorClass = "bg-rose-50 text-rose-700 ring-rose-600/20";
        if (row.priority === "Medium") colorClass = "bg-amber-50 text-amber-700 ring-amber-600/20";
        if (row.priority === "Low") colorClass = "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
        return <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${colorClass}`}>{row.priority}</span>
      } 
    },
    {
      id: "category",
      label: "Category",
      width: "w-[12%]",
      render: (row) => {
        if (!row.category || typeof row.category !== 'object') {
          return <span className="text-gray-400 text-sm font-medium">-</span>;
        }

        return (
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
            {row.category.name}
          </span>
        );
      }
    },
  ];

  // Action buttons
  const actions = [
    {
      icon: (
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
      label: "Preview",
      onClick: onPreview,
      color: "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50",
    },

    {
      icon: (
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      label: "Edit",
      onClick: onEdit,
      color: "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50",
    },

    {
      icon: (
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      label: "Delete",
      onClick: (row) => onDelete(row._id),
      color: "text-gray-400 hover:text-rose-600 hover:bg-rose-50",
    },
  ];

  // Toolbar configuration
  const toolbar = {
    title: "Leads Management",
    searchPlaceholder: "Search leads by name, email...",
    search: {
      value: filters.search,
      onChange: (value) => onFilterChange("search", value),
    },
    filters: [
      {
        value: filters.status,
        onChange: (value) => onFilterChange("status", value),
        options: [
          { value: "", label: "All Status" },
          { value: "New", label: "New" },
          { value: "Pending", label: "Pending" },
          { value: "In Progress", label: "In Progress" },
          { value: "On Hold", label: "On Hold" },
          { value: "Completed", label: "Completed" },
          { value: "Lost", label: "Lost" },
        ],
      },
      {
        value: filters.source,
        onChange: (value) => onFilterChange("source", value),
        options: [
          { value: "", label: "All Sources" },
          { value: "Website", label: "Website" },
          { value: "Referral", label: "Referral" },
          { value: "WhatsApp", label: "WhatsApp" },
          { value: "Cold Call", label: "Cold Call" },
          { value: "Event", label: "Event" },
          { value: "Other", label: "Other" },
        ],
      },
      {
        value: filters.category || "",
        onChange: (value) => onFilterChange("category", value),
        options: [
          { value: "", label: "All Categories" },
          ...((categories || []).map(cat => ({ value: cat._id, label: cat.name })))
        ],
      },
    ],
    onCreate: {
      label: "Add New Lead",
      onClick: onCreate,
    },
  };

  // Selection configuration
  const selection = {
    enabled: true,
    onBulkDelete: (selectedIds) => {
      selectedIds.forEach((id) => onDelete(id));
    },
  };

  // Custom mobile card render (standardized)
  const renderCard = (row, actions) => (
    <div
      className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => onPreview && onPreview(row)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 shrink-0 ring-1 ring-inset ring-gray-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-gray-900 truncate tracking-tight capitalize">{row.name ? row.name.toLowerCase() : "-"}</div>
            <div className="text-sm font-medium text-gray-500 truncate mt-0.5">{row.email ? row.email.toLowerCase() : "No email"}</div>
          </div>
        </div>

        <div className="flex items-start gap-2 shrink-0">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(row.status, row.isConverted)}`}>
            {row.isConverted ? "Converted" : row.status}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">Phone</div>
          <div className="text-gray-900 font-medium truncate">{row.phone || "-"}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">Organization</div>
          <div className="text-gray-900 font-medium truncate capitalize">{row.organizationName || "-"}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">Source</div>
          <div className="text-gray-900 font-medium truncate">{row.source || "-"}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">Priority</div>
          <div className="text-gray-900 font-medium truncate">{row.priority || "-"}</div>
        </div>
      </div>

      {row.category && (
        <div className="mt-4">
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
            {row.category.name}
          </span>
        </div>
      )}

      <div className="mt-4 flex justify-end gap-1.5 border-t border-gray-100 pt-4">
        {actions.map((action, idx) => {
          if (action.condition && !action.condition(row)) return null;
          return (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(row);
              }}
              className={`p-2 rounded-lg transition-colors duration-200 ${action.color}`}
              title={action.label}
            >
              {action.icon}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <AdvancedTable
      data={rows}
      columns={columns}
      actions={actions}
      toolbar={toolbar}
      renderCard={renderCard}
      onRowClick={onPreview}
      loading={loading}
      emptyMessage="No leads found"
      getRowId={(row) => row._id}
      pagination={{
        enabled: true,
        external: true,
        page: pagination?.page || 1,
        rowsPerPage: pagination?.limit || 10,
        total: pagination?.total || 0,
        onPageChange: onPageChange,
        onRowsPerPageChange: onLimitChange,
      }}
      selection={{
        enabled: true,
        onBulkDelete: (selectedIds) => {
          selectedIds.forEach((id) => onDelete(id));
        },
      }}
    />
  );
};

export default LeadsTable;

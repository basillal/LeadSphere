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
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    }
    switch (status) {
      case "New":
        return "bg-gray-200 text-black";
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "On Hold":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "Completed":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Lost":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-black";
    }
  };

  // Column definitions
  const columns = [
    {
      id: "name",
      label: "Name",
      width: "w-1/5",
      render: (row) => (
        <div>
          <div className="font-light text-black uppercase">{row.name}</div>
          <span className="block text-base text-black">{row.email}</span>
        </div>
      ),
    },
    {
      id: "organizationName",
      label: "Organization",
      width: "w-[15%]",
      render: (row) => (
        <span className="capitalize">{row.organizationName || "-"}</span>
      ),
    },
    {
      id: "createdBy",
      label: "Created by",
      width: "w-[12%]",
      render: (row) => row.createdBy?.name || "System",
    },
    {
      id: "tenant",
      label: "Organization",
      width: "w-[12%]",
      render: (row) => row.organization?.name || "-",
    },
    { id: "phone", label: "Phone", width: "w-[15%]" },
    { id: "source", label: "Source", width: "w-[15%]" },
    {
      id: "status",
      label: "Status",
      width: "w-[10%]",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-base font-light ${getStatusColor(row.status, row.isConverted)}`}
        >
          {row.isConverted ? "Converted" : row.status}
        </span>
      ),
    },
    { id: "priority", label: "Priority", width: "w-[10%]" },
    {
      id: "category",
      label: "Category",
      width: "w-[12%]",
      render: (row) => {
        if (!row.category || typeof row.category !== 'object') {
          return <span className="text-black text-base">-</span>;
        }

        return (
          <span 
            className="text-base font-light text-black uppercase tracking-wider"
          >
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
      color: "text-black hover:bg-gray-200",
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
      color: "text-black hover:bg-gray-200",
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
      color: "text-red-600 hover:bg-red-100",
    },
  ];

  // Toolbar configuration
  const toolbar = {
    title: "Leads",
    searchPlaceholder: "Search leads...",
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
      label: "Add lead",
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
      className="bg-white p-4 rounded-2xl shadow-[0_14px_50px_-12px_rgba(2,6,23,0.12)] border border-slate-100"
      onClick={() => onPreview && onPreview(row)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 flex items-center justify-center rounded-md bg-sky-50 text-sky-700 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-sky-700 truncate">{row.name}</div>
            <div className="text-sm text-slate-500 truncate">{row.category?.name || ""}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(row.status, row.isConverted)}`}>{row.isConverted ? "Converted" : row.status}</span>
        </div>
      </div>

      {row.category && (
        <div className="mt-3">
          <span className="text-sm font-light text-slate-700 uppercase tracking-wider">{row.category.name}</span>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-slate-700">
        <div>
          <div className="text-xs text-slate-500">Phone</div>
          <div className="mt-0.5 truncate">{row.phone || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Email</div>
          <div className="mt-0.5 truncate">{row.email || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Source</div>
          <div className="mt-0.5 truncate">{row.source || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Priority</div>
          <div className="mt-0.5 truncate">{row.priority || "-"}</div>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
        {actions.map((action, idx) => {
          if (action.condition && !action.condition(row)) return null;
          return (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(row);
              }}
              className={`p-2 rounded-lg transition-colors ${action.color}`}
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

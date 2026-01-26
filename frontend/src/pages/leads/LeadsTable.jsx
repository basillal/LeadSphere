import React from "react";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";

const LeadsTable = ({
  rows = [],
  onEdit,
  onDelete,
  onCreate,
  onPreview,
  onConvert,
  filters = { search: "", status: "", source: "" },
  onFilterChange,
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  // Helper function for status colors
  const getStatusColor = (status, isConverted) => {
    if (status === "Converted" && isConverted) {
      return "bg-gray-200 text-gray-700";
    }
    switch (status) {
      case "New":
        return "bg-gray-200 text-black";
      case "Contacted":
        return "bg-indigo-100 text-indigo-800";
      case "Follow-up":
        return "bg-yellow-100 text-yellow-800";
      case "Converted":
        return "bg-green-100 text-green-800";
      case "Lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <div className="font-medium text-gray-900">{row.name}</div>
          <span className="block text-xs text-gray-500">{row.email}</span>
        </div>
      ),
    },
    {
      id: "companyName",
      label: "Company",
      width: "w-[15%]",
      render: (row) => row.companyName || "-",
    },
    { id: "phone", label: "Phone", width: "w-[15%]" },
    { id: "source", label: "Source", width: "w-[15%]" },
    {
      id: "status",
      label: "Status",
      width: "w-[10%]",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status, row.isConverted)}`}
        >
          {row.status}
          {row.status === "Converted" && row.isConverted && (
            <span className="ml-1">✓</span>
          )}
        </span>
      ),
    },
    { id: "priority", label: "Priority", width: "w-[10%]" },
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
      color: "text-gray-600 hover:bg-gray-200",
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
      color: "text-gray-600 hover:bg-gray-200",
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
            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
          />
          <circle cx="9" cy="7" r="4" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          />
        </svg>
      ),
      label: "Convert to Contact",
      onClick: onConvert,
      condition: (row) =>
        row.status === "Converted" && !row.isConverted && onConvert,
      color: "text-green-600 hover:bg-green-100",
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
          { value: "Contacted", label: "Contacted" },
          { value: "Follow-up", label: "Follow-up" },
          { value: "Converted", label: "Converted" },
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
    ],
    onCreate: {
      label: "Add Lead",
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

  // Custom mobile card render
  const renderCard = (row, actions) => (
    <div
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200"
      onClick={() => onPreview && onPreview(row)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{row.name}</h3>
          <p className="text-xs text-gray-500">{row.companyName || "-"}</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status, row.isConverted)}`}
        >
          {row.status}
          {row.status === "Converted" && row.isConverted && (
            <span className="ml-1">✓</span>
          )}
        </span>
      </div>

      <div className="space-y-1 text-xs text-gray-600 mb-2">
        <p>
          <span className="font-medium">Phone:</span> {row.phone}
        </p>
        <p>
          <span className="font-medium">Email:</span> {row.email}
        </p>
        <p>
          <span className="font-medium">Source:</span> {row.source}
        </p>
        <p>
          <span className="font-medium">Priority:</span> {row.priority}
        </p>
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
        {actions.map((action, idx) => {
          if (action.condition && !action.condition(row)) return null;
          return (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(row);
              }}
              className={`text-sm font-medium flex items-center gap-1 ${action.color}`}
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

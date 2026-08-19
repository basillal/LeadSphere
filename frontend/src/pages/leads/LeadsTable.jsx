import React from "react";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";

const STATUS_STYLES = {
  New: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  "In Progress": "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  "On Hold": "bg-slate-50 text-slate-700 ring-slate-600/20",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Lost: "bg-rose-50 text-rose-700 ring-rose-600/20",
  default: "bg-gray-50 text-gray-700 ring-gray-600/20",
};

const PRIORITY_STYLES = {
  High: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  default: "bg-gray-50 text-gray-700 ring-gray-600/20",
};

const BADGE_BASE_CLASSES =
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset";

const getStatusClass = (status, isConverted = false) => {
  if (isConverted) {
    return `${BADGE_BASE_CLASSES} bg-emerald-50 text-emerald-700 ring-emerald-600/20`;
  }

  return `${BADGE_BASE_CLASSES} ${STATUS_STYLES[status] || STATUS_STYLES.default
    }`;
};

const getPriorityClass = (priority) => {
  return `${BADGE_BASE_CLASSES} ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.default
    }`;
};

const getInitial = (value) => {
  if (!value) return "?";
  return value.charAt(0).toUpperCase();
};

const formatText = (value, fallback = "-") => {
  if (!value) return fallback;
  return value;
};

const LeadsTable = ({
  rows = [],
  onEdit,
  onDelete,
  onCreate,
  onPreview,
  filters = {
    search: "",
    status: "",
    source: "",
    category: "",
  },
  onFilterChange,
  pagination,
  onPageChange,
  onLimitChange,
  loading = false,
  categories = [],
}) => {
  const handleBulkDelete = (selectedIds = []) => {
    selectedIds.forEach((id) => onDelete?.(id));
  };

  const renderLeadDetails = (row) => (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
        {getInitial(row.name)}
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        <div className="truncate text-sm font-semibold tracking-tight text-gray-900">
          {formatText(row.name, "-")}
        </div>

        <div className="mt-0.5 truncate text-xs font-medium text-gray-500">
          {row.email || "No email"}
        </div>
      </div>
    </div>
  );

  const renderSource = (row) => {
    if (!row.source) {
      return <span className="text-sm font-medium text-gray-400">-</span>;
    }

    return (
      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
        {row.source}
      </span>
    );
  };

  const renderStatus = (row) => (
    <span className={getStatusClass(row.status, row.isConverted)}>
      {row.isConverted ? "Converted" : row.status || "-"}
    </span>
  );

  const renderPriority = (row) => {
    if (!row.priority) {
      return <span className="text-sm font-medium text-gray-400">-</span>;
    }

    return (
      <span className={getPriorityClass(row.priority)}>
        {row.priority}
      </span>
    );
  };

  const renderCategory = (row) => {
    if (!row.category || typeof row.category !== "object") {
      return <span className="text-sm font-medium text-gray-400">-</span>;
    }

    return (
      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
        {row.category.name}
      </span>
    );
  };

  const columns = [
    {
      id: "name",
      label: "Lead Details",
      width: "w-1/5",
      render: renderLeadDetails,
    },
    {
      id: "organizationName",
      label: "Organization",
      width: "w-[15%]",
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">
          {formatText(row.organizationName)}
        </span>
      ),
    },
    {
      id: "createdBy",
      label: "Created By",
      width: "w-[12%]",
      render: (row) => (
        <span className="text-sm font-medium text-gray-600">
          {row.createdBy?.name || "System"}
        </span>
      ),
    },
    {
      id: "tenant",
      label: "Tenant Organization",
      width: "w-[12%]",
      render: (row) => (
        <span className="text-sm font-medium text-gray-600">
          {row.organization?.name || "-"}
        </span>
      ),
    },
    {
      id: "phone",
      label: "Phone",
      width: "w-[12%]",
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">
          {formatText(row.phone)}
        </span>
      ),
    },
    {
      id: "source",
      label: "Source",
      width: "w-[12%]",
      render: renderSource,
    },
    {
      id: "status",
      label: "Status",
      width: "w-[10%]",
      render: renderStatus,
    },
    {
      id: "priority",
      label: "Priority",
      width: "w-[10%]",
      render: renderPriority,
    },
    {
      id: "category",
      label: "Category",
      width: "w-[12%]",
      render: renderCategory,
    },
  ];

  const actions = [
    {
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
      color:
        "text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600",
    },
    {
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
      color:
        "text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600",
    },
    {
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
      onClick: (row) => onDelete?.(row._id),
      color:
        "text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600",
    },
  ];

  const toolbar = {
    title: "Leads Management",

    searchPlaceholder: "Search leads by name or email...",

    search: {
      value: filters.search,
      onChange: (value) => onFilterChange("search", value),
    },

    filters: [
      {
        value: filters.status,
        onChange: (value) => onFilterChange("status", value),
        options: [
          { value: "", label: "All Statuses" },
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
          ...(categories || []).map((category) => ({
            value: category._id,
            label: category.name,
          })),
        ],
      },
    ],

    onCreate: {
      label: "Add New Lead",
      onClick: onCreate,
    },
  };

  const renderCard = (row, rowActions) => (
    <div
      className="cursor-pointer rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 transition-shadow duration-200 hover:shadow-md"
      onClick={() => onPreview?.(row)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold tracking-tight text-gray-900">
              {formatText(row.name)}
            </div>

            <div className="mt-0.5 truncate text-sm font-medium text-gray-500">
              {row.email || "No email"}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <span className={getStatusClass(row.status, row.isConverted)}>
            {row.isConverted ? "Converted" : row.status || "-"}
          </span>
        </div>
      </div>

      {/* Lead Information */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="mb-1 text-xs font-medium text-gray-500">Phone</div>
          <div className="truncate font-medium text-gray-900">
            {formatText(row.phone)}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-gray-500">
            Organization
          </div>
          <div className="truncate font-medium text-gray-900">
            {formatText(row.organizationName)}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-gray-500">Source</div>
          <div className="truncate font-medium text-gray-900">
            {formatText(row.source)}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-gray-500">
            Priority
          </div>
          <div className="truncate font-medium text-gray-900">
            {formatText(row.priority)}
          </div>
        </div>
      </div>

      {/* Category */}
      {row.category?.name && (
        <div className="mt-4">
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
            {row.category.name}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-1.5 border-t border-gray-100 pt-4">
        {rowActions.map((action, index) => {
          if (action.condition && !action.condition(row)) {
            return null;
          }

          return (
            <button
              key={`${action.label}-${index}`}
              type="button"
              title={action.label}
              aria-label={action.label}
              onClick={(event) => {
                event.stopPropagation();
                action.onClick(row);
              }}
              className={`rounded-lg p-2 transition-colors duration-200 ${action.color}`}
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
        onPageChange,
        onRowsPerPageChange: onLimitChange,
      }}
      selection={{
        enabled: true,
        onBulkDelete: handleBulkDelete,
      }}
    />
  );
};

export default LeadsTable;
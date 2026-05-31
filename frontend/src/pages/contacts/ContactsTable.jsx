import React from "react";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";

const ContactsTable = ({
  contacts,
  onCreate,
  onEdit,
  onDelete,
  onView,
  filters,
  onFilterChange,
  pagination,
  onPageChange,
  onLimitChange,
  handleStartConversion, 
  categories = [], // Categories for filter
  loading = false,
}) => {
  // Helper functions
  const getTagColor = (tag) => {
    const colors = {
      Client: "bg-blue-100 text-blue-800",
      Vendor: "bg-purple-100 text-purple-800",
      Partner: "bg-green-100 text-green-800",
      Friend: "bg-orange-100 text-orange-800",
      Other: "bg-gray-100 text-black",
    };
    return colors[tag] || colors.Other;
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Column definitions
  const columns = [
    {
      id: "name",
      label: "Name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-light text-black uppercase">
            {row.name}
          </span>
          {row.designation && (
            <span className="text-base text-black">{row.designation}</span>
          )}
        </div>
      ),
    },
    {
      id: "organizationName",
      label: "Prospect Co.",
      render: (row) => (
        <span className="capitalize">{row.organizationName || "-"}</span>
      ),
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
      id: "category",
      label: "Category",
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
      },
    },
    { id: "phone", label: "Phone" },
    {
      id: "email",
      label: "Email",
      render: (row) => row.email || "-",
    },
    {
      id: "tags",
      label: "Tags",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags && row.tags.length > 0 ? (
            row.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-base font-light ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-black text-base">No tags</span>
          )}
        </div>
      ),
    },
    {
      id: "lastInteractionDate",
      label: "Last interaction",
      render: (row) => formatDate(row.lastInteractionDate),
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
      color: "text-black hover:bg-gray-100",
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
      color: "text-black hover:bg-gray-100",
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
    searchPlaceholder: "Search contacts...",
    filters: [
      {
        value: filters.tag,
        onChange: (value) => onFilterChange("tag", value),
        options: [
          { value: "", label: "All Tags" },
          { value: "Client", label: "Client" },
          { value: "Vendor", label: "Vendor" },
          { value: "Partner", label: "Partner" },
          { value: "Friend", label: "Friend" },
          { value: "Other", label: "Other" },
        ],
      },
      {
        value: filters.category,
        onChange: (value) => onFilterChange("category", value),
        options: [
          { value: "", label: "All Categories" },
          ...(categories || []).map((cat) => ({ value: cat._id, label: cat.name })),
        ],
      },
    ],
    onCreate: {
      label: "Add contact",
      onClick: onCreate,
    },
    extraButtons: [
      {
        label: "Convert lead",
        onClick: handleStartConversion,
        className:
          "bg-white border border-gray-300 text-black hover:bg-gray-50",
      },
    ],
  };

  // Custom mobile card (standardized)
  const renderCard = (row, actions) => (
    <div className="bg-white p-4 rounded-2xl shadow-[0_14px_50px_-12px_rgba(2,6,23,0.12)] border border-slate-100">
      <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 flex items-center justify-center rounded-md bg-slate-50 text-slate-700 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-slate-900 truncate">{row.name}</div>
            {row.designation ? (
              <div className="text-sm text-slate-500 truncate">{row.designation}</div>
            ) : (
              <div className="text-sm text-slate-500 truncate">{(row.tags || []).slice(0,2).join(", ") || ""}</div>
            )}
          </div>
        </div>
      </div>

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
          <div className="text-xs text-slate-500">Last contact</div>
          <div className="mt-0.5 truncate">{formatDate(row.lastInteractionDate)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Tags</div>
          <div className="mt-0.5 truncate">{(row.tags || []).join(", ") || "-"}</div>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
        {actions.map((action, idx) => (
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
        ))}
      </div>
    </div>
  );

  return (
    <AdvancedTable
      data={contacts}
      columns={columns}
      actions={actions}
      toolbar={toolbar}
      loading={loading}
      pagination={{
        enabled: true,
        external: true,
        page: pagination?.page || 1,
        rowsPerPage: pagination?.limit || 10,
        total: pagination?.total || 0,
        rowsPerPageOptions: [10, 25, 50, 100],
        onPageChange: onPageChange,
        onRowsPerPageChange: onLimitChange,
      }}
      renderCard={renderCard}
      emptyMessage="No contacts found"
      getRowId={(row) => row._id}
    />
  );
};

export default ContactsTable;

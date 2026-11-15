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
      Client: "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]",
      Vendor: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]",
      Partner: "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]",
      Friend: "bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF]",
      Other: "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]",
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
      label: "Contact",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FFF1EB] text-[var(--primary)] text-[11px] font-bold flex items-center justify-center flex-shrink-0">
            {row.name ? row.name.charAt(0).toUpperCase() : "C"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-[#111827] truncate">
              {row.name}
            </span>
            <span className="text-[9.5px] text-[#9CA3AF] truncate">
              {row.designation || row.organizationName || "Contact"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "organizationName",
      label: "Prospect Co.",
      render: (row) => (
        <span className="capitalize text-[10.5px] font-medium text-gray-700 whitespace-nowrap">{row.organizationName || "-"}</span>
      ),
    },
    {
      id: "createdBy",
      label: "Created by",
      render: (row) => <span className="text-[10.5px] font-medium text-gray-600 whitespace-nowrap">{row.createdBy?.name || "System"}</span>,
    },
    {
      id: "tenant",
      label: "Organization",
      render: (row) => <span className="text-[10.5px] font-medium text-gray-600 whitespace-nowrap">{row.organization?.name || "-"}</span>,
    },
    {
      id: "category",
      label: "Category",
      render: (row) => {
        if (!row.category || typeof row.category !== 'object') {
          return <span className="text-[10.5px] text-gray-400">-</span>;
        }
        
        return (
          <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF] px-2.5 py-0.5 text-[9.5px] font-semibold">
            {row.category.name}
          </span>
        );
      },
    },
    { 
      id: "phone", 
      label: "Phone",
      render: (row) => <span className="text-[10.5px] font-medium text-gray-700 whitespace-nowrap">{row.phone || "-"}</span>,
    },
    {
      id: "email",
      label: "Email",
      render: (row) => <span className="text-[10.5px] text-gray-600 whitespace-nowrap">{row.email || "-"}</span>,
    },
    {
      id: "tags",
      label: "Tags",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1">
          {row.tags && row.tags.length > 0 ? (
            row.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9.5px] font-semibold ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[10.5px] text-gray-400">No tags</span>
          )}
        </div>
      ),
    },
    {
      id: "lastInteractionDate",
      label: "Last interaction",
      render: (row) => <span className="text-[10.5px] text-gray-600 whitespace-nowrap">{formatDate(row.lastInteractionDate)}</span>,
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
      color: "em-icon-view",
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
            strokeWidth={1.8}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      label: "Edit",
      onClick: onEdit,
      color: "em-icon-edit",
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
            strokeWidth={1.8}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      label: "Delete",
      onClick: (row) => onDelete(row._id),
      color: "em-icon-delete",
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
          "bg-white border border-gray-300 text-black hover:bg-slate-50",
      },
    ],
  };

  // Custom mobile card (standardized)
  const renderCard = (row, actions) => (
    <div className="bg-white p-3.5 rounded-[14px] border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#FFF1EB] text-[var(--primary)] text-[11px] font-bold shrink-0">
            {row.name ? row.name.charAt(0).toUpperCase() : "C"}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#111827] truncate">{row.name}</div>
            {row.designation ? (
              <div className="text-[9.5px] text-[#9CA3AF] truncate">{row.designation}</div>
            ) : (
              <div className="text-[9.5px] text-[#9CA3AF] truncate">{(row.tags || []).slice(0, 2).join(", ") || ""}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[10.5px] text-gray-600">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[#8B92A5] font-semibold">Phone</div>
          <div className="mt-0.5 truncate text-[#111827] font-medium">{row.phone || "-"}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[#8B92A5] font-semibold">Email</div>
          <div className="mt-0.5 truncate text-[#111827] font-medium">{row.email || "-"}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[#8B92A5] font-semibold">Last contact</div>
          <div className="mt-0.5 truncate">{formatDate(row.lastInteractionDate)}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[#8B92A5] font-semibold">Category</div>
          <div className="mt-0.5 truncate">
            {row.category?.name ? (
              <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF] px-2 py-0.5 text-[9px] font-semibold">
                {row.category.name}
              </span>
            ) : "-"}
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-1 border-t border-gray-100 pt-2.5">
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

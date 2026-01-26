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
}) => {
  // Helper functions
  const getTagColor = (tag) => {
    const colors = {
      Client: "bg-blue-100 text-blue-800",
      Vendor: "bg-purple-100 text-purple-800",
      Partner: "bg-green-100 text-green-800",
      Friend: "bg-orange-100 text-orange-800",
      Other: "bg-gray-100 text-gray-800",
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
          <span className="font-semibold text-gray-900">{row.name}</span>
          {row.designation && (
            <span className="text-xs text-gray-500">{row.designation}</span>
          )}
        </div>
      ),
    },
    {
      id: "companyName",
      label: "Company",
      render: (row) => row.companyName || "-",
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
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">No tags</span>
          )}
        </div>
      ),
    },
    {
      id: "lastInteractionDate",
      label: "Last Interaction",
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
    ],
    onCreate: {
      label: "Add Contact",
      onClick: onCreate,
    },
  };

  // Custom mobile card
  const renderCard = (row, actions) => (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{row.name}</h3>
          <p className="text-xs text-gray-500">{row.companyName || "-"}</p>
          {row.designation && (
            <p className="text-xs text-gray-400">{row.designation}</p>
          )}
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-600 mb-2">
        <p>
          <span className="font-medium">Phone:</span> {row.phone}
        </p>
        {row.email && (
          <p>
            <span className="font-medium">Email:</span> {row.email}
          </p>
        )}
        <p>
          <span className="font-medium">Last Contact:</span>{" "}
          {formatDate(row.lastInteractionDate)}
        </p>
      </div>

      {row.tags && row.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {row.tags.map((tag, index) => (
            <span
              key={index}
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(row);
            }}
            className={`p-1.5 rounded transition-colors ${action.color}`}
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

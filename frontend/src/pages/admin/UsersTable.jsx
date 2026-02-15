import React from "react";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";
import { useAuth } from "../../components/auth/AuthProvider";

const UsersTable = ({
  rows = [],
  onEdit,
  onDelete,
  onCreate,
  onResetPassword,
  filters = { search: "" },
  onFilterChange,
}) => {
  const { user } = useAuth();

  // Helper for status colors
  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  // Column definitions
  const columns = [
    {
      id: "name",
      label: "Name",
      width: "w-1/4",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 uppercase">{row.name}</div>
        </div>
      ),
    },
    {
      id: "email",
      label: "Email",
      width: "w-1/4",
      render: (row) => <span className="text-gray-600">{row.email}</span>,
    },
    {
      id: "company",
      label: "Company",
      width: "w-1/4",
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">
          {row.company?.name || "-"}
        </span>
      ),
    },
    {
      id: "role",
      label: "Role",
      width: "w-1/4",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.role?.isSystemRole
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.role?.roleName || "No Role"}
        </span>
      ),
    },
    {
      id: "status",
      label: "Status",
      width: "w-1/4",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            row.isActive,
          )}`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
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
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
      label: "Reset Password",
      onClick: (row) => onResetPassword && onResetPassword(row._id),
      color: "text-amber-600 hover:bg-amber-100",
      condition: (row) => onResetPassword,
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
      condition: (row) => user?.role?.roleName === "Super Admin",
    },
  ];

  // Toolbar configuration
  const toolbar = {
    title: "Users",
    searchPlaceholder: "Search users...",
    search: {
      value: filters.search,
      onChange: (value) => onFilterChange("search", value),
    },
    filters: [], // No extra filters for now
    onCreate: {
      label: "Add User",
      onClick: onCreate,
    },
  };

  const renderCard = (row, actions) => (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{row.name}</h3>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            row.isActive,
          )}`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="text-xs text-gray-600 mb-2">
        <span className="font-medium">Role:</span>{" "}
        {row.role?.roleName || "No Role"}
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
        {actions.map((action, idx) => (
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
        ))}
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
      emptyMessage="No users found"
      getRowId={(row) => row._id}
      pagination={{
        enabled: true, // Internal pagination for specific lists if needed, or external. Let's use internal for usually small user lists.
        external: false,
        rowsPerPage: 10,
      }}
    />
  );
};

export default UsersTable;

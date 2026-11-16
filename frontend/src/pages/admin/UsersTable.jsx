import React from "react";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";
import { useAuth } from "../../components/auth/AuthProvider";

const UsersTable = ({
  rows = [],
  onEdit,
  onDelete,
  onCreate,
  onResetPassword,
  onViewLogs,
  filters = { search: "" },
  onFilterChange,
}) => {
  const { user } = useAuth();

  // Helper for status colors
  const getStatusBadge = (isActive) => {
    return (
      <span
        className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold border ${
          isActive
            ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]"
            : "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  // Column definitions
  const columns = [
    {
      id: "name",
      label: "Name",
      render: (row) => (
        <span className="font-semibold text-gray-900 text-[11px] whitespace-nowrap">{row.name}</span>
      ),
    },
    {
      id: "email",
      label: "Email",
      render: (row) => <span className="text-gray-600 text-[10.5px] whitespace-nowrap">{row.email}</span>,
    },
    {
      id: "organization",
      label: "Organization",
      render: (row) => (
        <span className="text-[10.5px] text-gray-600 whitespace-nowrap">
          {row.organization?.name || "-"}
        </span>
      ),
    },
    {
      id: "role",
      label: "Role",
      render: (row) => (
        <span
          className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold border ${
            row.role?.isSystemRole
              ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
              : "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
          }`}
        >
          {row.role?.roleName || "No Role"}
        </span>
      ),
    },
    {
      id: "status",
      label: "Status",
      render: (row) => getStatusBadge(row.isActive),
    },
  ];

  // Action buttons
  const actions = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
      ),
      label: "View Logs",
      onClick: onViewLogs,
      color: "text-blue-600 hover:bg-blue-100",
      condition: (row) => user?.role?.roleName === "Super Admin" && onViewLogs,
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
    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-black text-base">{row.name}</h3>
          <p className="text-base text-black">{row.email}</p>
        </div>
        {getStatusBadge(row.isActive)}
      </div>
      <div className="text-base text-black mb-2">
        <span className="font-medium">Role:</span>{" "}
        {row.role?.roleName || "No Role"}
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-200 pt-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(row);
            }}
            className={`text-base font-medium flex items-center gap-1 ${action.color}`}
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

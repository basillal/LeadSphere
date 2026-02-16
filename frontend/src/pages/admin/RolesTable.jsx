import React from "react";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";

const RolesTable = ({
  rows = [],
  onEdit,
  onDelete,
  onCreate,
  filters = { search: "" },
  onFilterChange,
}) => {
  // Column definitions
  const columns = [
    {
      id: "roleName",
      label: "Role Name",
      width: "w-1/4",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 uppercase">
            {row.roleName}
          </div>
          {row.isSystemRole && (
            <span className="text-[10px] uppercase tracking-wide bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
              System
            </span>
          )}
        </div>
      ),
    },
    {
      id: "organization",
      label: "Organization",
      width: "w-1/4",
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">
          {row.organization?.name || "System/All"}
        </span>
      ),
    },
    {
      id: "description",
      label: "Description",
      width: "w-1/2",
      render: (row) => <span className="text-gray-600">{row.description}</span>,
    },
    {
      id: "permissions",
      label: "Permissions",
      width: "w-1/4",
      render: (row) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
          {row.permissions?.length || 0} permissions
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      label: "Delete",
      onClick: (row) => onDelete(row._id),
      condition: (row) => !row.isSystemRole,
      color: "text-red-600 hover:bg-red-100",
    },
  ];

  // Toolbar configuration
  const toolbar = {
    title: "Roles",
    searchPlaceholder: "Search roles...",
    search: {
      value: filters.search,
      onChange: (value) => onFilterChange("search", value),
    },
    filters: [],
    onCreate: {
      label: "Add Role",
      onClick: onCreate,
    },
  };

  const renderCard = (row, actions) => (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            {row.roleName}
          </h3>
          {row.isSystemRole && (
            <span className="text-[10px] uppercase tracking-wide bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
              System
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {row.permissions?.length || 0} perms
        </span>
      </div>
      <p className="text-xs text-gray-600 mb-2">{row.description}</p>

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
      emptyMessage="No roles found"
      getRowId={(row) => row._id}
      pagination={{
        enabled: true,
        external: false,
        rowsPerPage: 10,
      }}
    />
  );
};

export default RolesTable;

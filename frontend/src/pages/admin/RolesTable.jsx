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
      render: (row) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-semibold text-gray-900 text-[11px]">
            {row.roleName}
          </span>
          {row.isSystemRole && (
            <span className="inline-flex items-center justify-center whitespace-nowrap text-[8.5px] uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-1.5 py-0.5 rounded-full font-bold">
              System
            </span>
          )}
        </div>
      ),
    },
    {
      id: "organization",
      label: "Organization",
      render: (row) => (
        <span className="text-[10.5px] text-gray-600 whitespace-nowrap">
          {row.organization?.name || "System/All"}
        </span>
      ),
    },
    {
      id: "description",
      label: "Description",
      render: (row) => <span className="text-[10.5px] text-gray-500 max-w-md truncate">{row.description || "-"}</span>,
    },
    {
      id: "permissions",
      label: "Permissions",
      render: (row) => (
        <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] rounded-full text-[9.5px] font-semibold">
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
      condition: (row) => !row.isSystemRole,
      color: "em-icon-delete",
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
    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-black text-base">
            {row.roleName}
          </h3>
          {row.isSystemRole && (
            <span className="text-base uppercase tracking-wide bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
              System
            </span>
          )}
        </div>
        <span className="text-base text-black bg-slate-100 px-2 py-0.5 rounded">
          {row.permissions?.length || 0} perms
        </span>
      </div>
      <p className="text-base text-black mb-2">{row.description}</p>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-2">
        {actions.map((action, idx) => {
          if (action.condition && !action.condition(row)) return null;
          return (
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

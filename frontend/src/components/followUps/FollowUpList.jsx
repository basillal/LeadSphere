import React from "react";
import AdvancedTable from "../common/AdvancedTable";

const FollowUpList = ({
  followUps,
  onEdit,
  onDelete,
  onStatusChange,
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Missed: "bg-red-100 text-red-800",
      Rescheduled: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Define columns
  const columns = [
    {
      id: "status",
      label: "Status",
      width: "w-32",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}
          >
            {row.status}
          </span>
          {row.status === "Pending" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(row, "Completed");
              }}
              className="text-xs text-green-600 hover:underline"
            >
              Mark Done
            </button>
          )}
        </div>
      ),
    },
    {
      id: "scheduledAt",
      label: "Due Date",
      render: (row) => (
        <span className="text-sm">{formatDate(row.scheduledAt)}</span>
      ),
    },
    {
      id: "lead",
      label: "Lead",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 text-sm">
            {row.lead?.name || "Unknown"}
          </div>
          <div className="text-xs text-gray-500">{row.lead?.phone || ""}</div>
        </div>
      ),
    },
    {
      id: "type",
      label: "Type",
      render: (row) => (
        <span className="text-sm text-gray-600">{row.type}</span>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      render: (row) => (
        <span className="text-sm text-gray-500 line-clamp-2 max-w-xs">
          {row.notes || "-"}
        </span>
      ),
    },
  ];

  // Define actions
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
      onClick: (row) => onEdit(row),
      color: "text-indigo-600 hover:bg-indigo-100",
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

  // Custom mobile card render
  const renderCard = (row, actions) => (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div className="overflow-hidden flex-1">
          <p className="font-semibold text-gray-900 truncate text-sm">
            {row.lead?.name || "Unknown"}
          </p>
          <p className="text-xs text-gray-500 truncate">{row.lead?.phone}</p>
        </div>
        <span
          className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}
        >
          {row.status}
        </span>
      </div>

      <div className="space-y-1 text-xs text-gray-600 mb-2">
        <div className="flex items-center">
          <span className="w-16 font-medium flex-shrink-0">Type:</span>
          <span className="truncate">{row.type}</span>
        </div>
        <div className="flex items-center">
          <span className="w-16 font-medium flex-shrink-0">Due:</span>
          <span className="truncate">{formatDate(row.scheduledAt)}</span>
        </div>
        {row.notes && (
          <div className="bg-gray-50 p-2 rounded text-xs mt-1 break-words">
            {row.notes}
          </div>
        )}
      </div>

      <div className="flex justify-end items-center gap-2 border-t border-gray-100 pt-2">
        {row.status === "Pending" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(row, "Completed");
            }}
            className="text-xs text-green-600 font-medium hover:text-green-700"
          >
            Mark Done
          </button>
        )}
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(row);
            }}
            className={`p-1.5 rounded-lg transition-colors ${action.color}`}
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
      data={followUps}
      columns={columns}
      actions={actions}
      renderCard={renderCard}
      emptyMessage="No follow-ups found."
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
      selection={{ enabled: false }}
    />
  );
};

export default FollowUpList;

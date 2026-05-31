import React from "react";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";

const FollowUpList = ({
  followUps,
  onEdit,
  onDelete,
  onStatusChange,
  pagination,
  onPageChange,
  onLimitChange,
  loading = false,
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
    return colors[status] || "bg-gray-100 text-black";
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
            className={`px-2 py-1 rounded-full text-base font-light ${getStatusColor(row.status)}`}
          >
            {row.status}
          </span>
          {row.status === "Pending" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(row, "Completed");
              }}
              className="text-base text-green-600 hover:underline"
            >
              Mark done
            </button>
          )}
        </div>
      ),
    },
    {
      id: "scheduledAt",
      label: "Due date",
      render: (row) => (
        <span className="text-base">{formatDate(row.scheduledAt)}</span>
      ),
    },
    {
      id: "lead",
      label: "Lead",
      render: (row) => (
        <div>
          <div className="font-light text-black text-base uppercase">
            {row.lead?.name || "Unknown"}
          </div>
          <div className="text-base text-black">
            {row.lead?.organizationName && (
              <span className="font-light text-black block md:inline md:mr-1">
                {row.lead.organizationName}
              </span>
            )}
            <span className="block md:inline">{row.lead?.phone || ""}</span>
            {row.lead?.category && (
              <span 
                className="ml-2 text-base font-light text-black uppercase tracking-wider"
              >
                {typeof row.lead.category === 'object' ? row.lead.category.name : ''}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "type",
      label: "Type",
      render: (row) => (
        <span className="text-base text-black">{row.type}</span>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      render: (row) => (
        <span className="text-base text-black line-clamp-2 max-w-xs">
          {row.notes || "-"}
        </span>
      ),
    },
    {
      id: "organization",
      label: "Organization",
      render: (row) => (
        <span className="text-base text-black">
          {row.organization?.name || "-"}
        </span>
      ),
    },
    {
      id: "createdBy",
      label: "Created by",
      render: (row) => (
        <span className="text-base text-black">
          {row.createdBy?.name || "System"}
        </span>
      ),
    },
    {
      id: "assignedTo",
      label: "Assigned to",
      render: (row) => (
        <span className="text-base text-blue-600 font-light">
          {row.assignedTo?.name || "System"}
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
            <p className="text-lg font-bold text-slate-900 truncate uppercase">{row.lead?.name || "Unknown"}</p>
            <p className="text-sm text-slate-500 truncate">{row.lead?.phone || "-"}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(row.status)}`}>{row.status}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-slate-700">
        <div>
          <div className="text-xs text-slate-500">Type</div>
          <div className="mt-0.5 truncate">{row.type}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Due</div>
          <div className="mt-0.5 truncate">{formatDate(row.scheduledAt)}</div>
        </div>
        {row.organization && (
          <div>
            <div className="text-xs text-slate-500">Org</div>
            <div className="mt-0.5 truncate">{row.organization.name}</div>
          </div>
        )}
        <div>
          <div className="text-xs text-slate-500">Assigned</div>
          <div className="mt-0.5 truncate">{row.assignedTo?.name || "-"}</div>
        </div>
      </div>

      {row.notes && <div className="bg-gray-50 p-2 rounded mt-3 text-sm text-slate-700">{row.notes}</div>}

      <div className="mt-3 flex flex-col sm:flex-row sm:justify-end gap-2">
        {row.status === "Pending" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(row, "Completed");
            }}
            className="px-3 py-1.5 rounded bg-green-100 text-green-700 font-medium hover:bg-green-200"
          >
            Mark Done
          </button>
        )}

        <div className="flex gap-2 justify-end">
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
      loading={loading}
    />
  );
};

export default FollowUpList;

import React from "react";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";
import { formatDateTime } from "../../utils/dateUtils";

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
  const formatDate = (dateString) => formatDateTime(dateString);

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]",
      Completed: "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]",
      Missed: "bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]",
      Rescheduled: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]",
    };
    return colors[status] || "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]";
  };

  // Define columns
  const columns = [
    {
      id: "status",
      label: "Status",
      render: (row) => (
        <div className="flex flex-col gap-1 items-start">
          <span
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9.5px] font-semibold ${getStatusColor(row.status)}`}
          >
            {row.status}
          </span>
          {row.status === "Pending" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(row, "Completed");
              }}
              className="text-[9.5px] text-[var(--primary)] hover:underline font-medium"
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
        <span className="text-[10.5px] text-gray-700 whitespace-nowrap">{formatDate(row.scheduledAt)}</span>
      ),
    },
    {
      id: "lead",
      label: "Lead",
      render: (row) => (
        <div>
          <div className="text-[11px] font-semibold text-[#111827] whitespace-nowrap">
            {row.lead?.name || "Unknown"}
          </div>
          <div className="text-[9.5px] text-[#9CA3AF] flex items-center gap-1.5 flex-wrap mt-0.5">
            {row.lead?.organizationName && (
              <span className="font-medium text-[#4B5563] whitespace-nowrap">
                {row.lead.organizationName}
              </span>
            )}
            {row.lead?.phone && <span className="whitespace-nowrap">{row.lead.phone}</span>}
            {row.lead?.category && (
              <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF] px-2 py-0.5 text-[9px] font-semibold">
                {typeof row.lead.category === 'object' ? row.lead.category.name : row.lead.category}
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
        <span className="text-[10.5px] text-gray-700 whitespace-nowrap">{row.type}</span>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      render: (row) => (
        <span className="text-[10.5px] text-gray-600 line-clamp-1 max-w-xs">
          {row.notes || "-"}
        </span>
      ),
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
      id: "createdBy",
      label: "Created by",
      render: (row) => (
        <span className="text-[10.5px] font-medium text-gray-600 whitespace-nowrap">
          {row.createdBy?.name || "System"}
        </span>
      ),
    },
    {
      id: "assignedTo",
      label: "Assigned to",
      render: (row) => (
        <span className="text-[10.5px] text-[var(--primary)] font-medium whitespace-nowrap">
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
      onClick: (row) => onEdit(row),
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

  // Custom mobile card render
  const renderCard = (row, actions) => (
    <div className="bg-white p-3.5 rounded-[14px] border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#FFF1EB] text-[var(--primary)] text-[11px] font-bold shrink-0">
            {row.lead?.name ? row.lead.name.charAt(0).toUpperCase() : "L"}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#111827] truncate uppercase">{row.lead?.name || "Unknown"}</p>
            <p className="text-[9.5px] text-[#9CA3AF] truncate">{row.lead?.phone || "-"}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold ${getStatusColor(row.status)}`}>{row.status}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[10.5px] text-gray-600">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[#8B92A5] font-semibold">Type</div>
          <div className="mt-0.5 truncate text-[#111827] font-medium">{row.type}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[#8B92A5] font-semibold">Due</div>
          <div className="mt-0.5 truncate">{formatDate(row.scheduledAt)}</div>
        </div>
        {row.organization && (
          <div>
            <div className="text-[9px] uppercase tracking-wider text-[#8B92A5] font-semibold">Org</div>
            <div className="mt-0.5 truncate">{row.organization.name}</div>
          </div>
        )}
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[#8B92A5] font-semibold">Assigned</div>
          <div className="mt-0.5 truncate text-[var(--primary)] font-medium">{row.assignedTo?.name || "-"}</div>
        </div>
      </div>

      {row.notes && <div className="bg-gray-50 p-2 rounded-lg mt-2.5 text-[10px] text-gray-600">{row.notes}</div>}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
        <div>
          {row.status === "Pending" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(row, "Completed");
              }}
              className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] text-[9.5px] font-semibold hover:bg-green-100"
            >
              Mark Done
            </button>
          )}
        </div>

        <div className="flex gap-1 justify-end">
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

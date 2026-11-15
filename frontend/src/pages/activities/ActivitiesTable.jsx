import React, { useState } from "react";
import EmptyTableState from "../../components/common/EmptyTableState";

const ActivitiesTable = ({
  activities,
  onCreate,
  onEdit,
  onDelete,
  onView,
  filters,
  onFilterChange,
  onDateFilterChange,
  dateRange,
  onDateRangeChange,
  pagination,
  categories = [], // Categories for filter
  onPageChange,
  onLimitChange,
}) => {
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Helper function to determine date context
  const getDateContext = (activityDate, status) => {
    if (!activityDate) return "none";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const actDate = new Date(activityDate);
    const actDateOnly = new Date(
      actDate.getFullYear(),
      actDate.getMonth(),
      actDate.getDate(),
    );

    const diffTime = actDateOnly - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "tomorrow";
    if (diffDays < 0 && status === "Scheduled") return "overdue";
    if (diffDays < 0) return "past";
    return "future";
  };

  // Helper function to format relative date
  const getRelativeDate = (activityDate) => {
    if (!activityDate) return "-";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const actDate = new Date(activityDate);
    const actDateOnly = new Date(
      actDate.getFullYear(),
      actDate.getMonth(),
      actDate.getDate(),
    );

    const diffTime = actDateOnly - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7)
      return `${Math.abs(diffDays)} days ago`;

    return formatDate(activityDate);
  };

  const getActivityTypeIcon = (type) => {
    const icons = {
      Call: "📞",
      Meeting: "🤝",
      Email: "✉️",
      WhatsApp: "💬",
      Note: "📝",
      Task: "✅",
      Other: "📋",
    };
    return icons[type] || "📋";
  };

  const getStatusBadge = (status) => {
    const map = {
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold border ${
          map[status] || "bg-gray-100 text-gray-700 border-gray-200"
        }`}
      >
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const map = {
      Low: "bg-gray-100 text-gray-700 border-gray-200",
      Medium: "bg-blue-50 text-blue-700 border-blue-200",
      High: "bg-orange-50 text-orange-700 border-orange-200",
      Urgent: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold border ${
          map[priority] || "bg-gray-100 text-gray-700 border-gray-200"
        }`}
      >
        {priority}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedActivities(activities.map((a) => a._id));
    } else {
      setSelectedActivities([]);
    }
  };

  const handleSelectActivity = (id) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  return (
    <div className="em-card p-0 flex flex-col overflow-hidden">
      {/* Header with Search and Filters */}
      <div className="p-3.5 border-b border-gray-100 bg-white">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search activities..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="search-bar w-full h-[34px] pl-9 pr-3 rounded-full text-[11px] font-medium bg-white border border-[#D1D5DB] focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="md:hidden em-btn-clear h-[34px] px-3.5 inline-flex items-center gap-1.5"
            >
              <span>Filters</span>
              <svg
                className={`h-3.5 w-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Activity Type Filter */}
            <select
              value={filters.activityType || ""}
              onChange={(e) => onFilterChange("activityType", e.target.value)}
              className={`${filtersOpen ? "block" : "hidden"} md:block h-[34px] px-3 text-[11px] font-medium border border-[#D1D5DB] rounded-[10px] bg-white focus:outline-none focus:ring-1 focus:ring-gray-900`}
            >
              <option value="">All Types</option>
              <option value="Call">📞 Call</option>
              <option value="Meeting">🤝 Meeting</option>
              <option value="Email">✉️ Email</option>
              <option value="WhatsApp">💬 WhatsApp</option>
              <option value="Note">📝 Note</option>
              <option value="Task">✅ Task</option>
              <option value="Other">📋 Other</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status || ""}
              onChange={(e) => onFilterChange("status", e.target.value)}
              className={`${filtersOpen ? "block" : "hidden"} md:block h-[34px] px-3 text-[11px] font-medium border border-[#D1D5DB] rounded-[10px] bg-white focus:outline-none focus:ring-1 focus:ring-gray-900`}
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Category Filter */}
            <select
              value={filters.category || ""}
              onChange={(e) => onFilterChange("category", e.target.value)}
              className={`${filtersOpen ? "block" : "hidden"} md:block h-[34px] px-3 text-[11px] font-medium border border-[#D1D5DB] rounded-[10px] bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 min-w-[120px]`}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Create Button */}
            <button
              onClick={onCreate}
              className="em-add h-[34px] px-4 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden md:inline">New Activity</span>
              <span className="md:hidden">Create</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              <th className="w-10 px-4 py-2.5 whitespace-nowrap select-none">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedActivities.length === activities.length &&
                    activities.length > 0
                  }
                  className="w-3.5 h-3.5 accent-[var(--primary)] rounded cursor-pointer"
                />
              </th>
              <th className="px-4 py-2.5 text-[9px] font-semibold text-[#8B92A5] tracking-[0.08em] uppercase whitespace-nowrap select-none">
                Type
              </th>
              <th className="px-4 py-2.5 text-[9px] font-semibold text-[#8B92A5] tracking-[0.08em] uppercase whitespace-nowrap select-none">
                Title
              </th>
              <th className="px-4 py-2.5 text-[9px] font-semibold text-[#8B92A5] tracking-[0.08em] uppercase whitespace-nowrap select-none">
                Related To
              </th>
              <th className="px-4 py-2.5 text-[9px] font-semibold text-[#8B92A5] tracking-[0.08em] uppercase whitespace-nowrap select-none">
                Date & Time
              </th>
              <th className="px-4 py-2.5 text-[9px] font-semibold text-[#8B92A5] tracking-[0.08em] uppercase whitespace-nowrap select-none">
                Organization
              </th>
              <th className="px-4 py-2.5 text-[9px] font-semibold text-[#8B92A5] tracking-[0.08em] uppercase whitespace-nowrap select-none">
                Status
              </th>
              <th className="px-4 py-2.5 text-[9px] font-semibold text-[#8B92A5] tracking-[0.08em] uppercase whitespace-nowrap select-none">
                Priority
              </th>
              <th className="px-4 py-2.5 text-right text-[9px] font-semibold text-[#8B92A5] tracking-[0.08em] uppercase whitespace-nowrap select-none">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {activities.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-12 text-center">
                  <EmptyTableState
                    title="No activities found"
                    description="Create your first activity to start tracking meetings, calls, and follow-ups."
                  />
                </td>
              </tr>
            ) : (
              activities.map((activity) => {
                const dateContext = getDateContext(
                  activity.activityDate,
                  activity.status,
                );
                const borderClass =
                  dateContext === "today"
                    ? "border-l-4 border-l-blue-500 bg-blue-50/20"
                    : dateContext === "overdue"
                      ? "border-l-4 border-l-rose-500 bg-rose-50/20"
                      : "";

                return (
                  <tr
                    key={activity._id}
                    className={`hover:bg-[#FCFCFC] transition-colors border-t border-gray-100 ${borderClass}`}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity._id)}
                        onChange={() => handleSelectActivity(activity._id)}
                        className="w-3.5 h-3.5 accent-[var(--primary)] rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-[13px]" title={activity.activityType}>
                        {getActivityTypeIcon(activity.activityType)}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-[11px] font-semibold text-gray-900 line-clamp-1">
                        {activity.title}
                      </div>
                      {activity.description && (
                        <div className="text-[9.5px] text-gray-400 truncate max-w-xs">
                          {activity.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-[11px] font-medium text-gray-800">
                        {activity.relatedName || "-"}
                      </div>
                      <div className="text-[9.5px] text-gray-400">
                        {activity.relatedTo}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div
                        className={`text-[10.5px] font-medium ${
                          dateContext === "today"
                            ? "text-blue-600 font-semibold"
                            : dateContext === "overdue"
                              ? "text-rose-600 font-semibold"
                              : "text-gray-700"
                        }`}
                      >
                        {getRelativeDate(activity.activityDate)}
                      </div>
                      {activity.startTime && (
                        <div className="text-[9.5px] text-gray-400">
                          {activity.startTime}
                        </div>
                      )}
                      {dateContext === "overdue" && (
                        <div className="mt-0.5">
                          <span className="inline-flex px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-[#FEE2E2] text-[#DC2626] uppercase">
                            Overdue
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-[10.5px] text-gray-600 whitespace-nowrap">
                      {activity.organization?.name || "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {getStatusBadge(activity.status)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {getPriorityBadge(activity.priority)}
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onView(activity)}
                          className="em-icon-btn em-icon-view"
                          title="View"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
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
                        </button>
                        <button
                          onClick={() => onEdit(activity)}
                          className="em-icon-btn em-icon-edit"
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(activity._id)}
                          className="em-icon-btn em-icon-delete"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-100 flex-1 bg-white">
        {activities.length === 0 ? (
          <EmptyTableState
            title="No activities found"
            description="Create your first activity to start tracking meetings, calls, and follow-ups."
          />
        ) : (
          activities.map((activity) => {
            const dateContext = getDateContext(
              activity.activityDate,
              activity.status,
            );
            const borderClass =
              dateContext === "today"
                ? "border-l-4 border-l-blue-500 bg-blue-50/20"
                : dateContext === "overdue"
                  ? "border-l-4 border-l-rose-500 bg-rose-50/20"
                  : "";

            return (
              <div
                key={activity._id}
                className={`p-3.5 ${borderClass}`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 flex items-center justify-center rounded-[8px] bg-gray-100 text-gray-700 shrink-0 text-[13px]">
                      {getActivityTypeIcon(activity.activityType)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-gray-900 truncate">
                        {activity.title}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {activity.relatedName} • {activity.relatedTo}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {getStatusBadge(activity.status)}
                  </div>
                </div>

                {activity.description && (
                  <p className="text-[10.5px] text-gray-600 line-clamp-2 mt-2">
                    {activity.description}
                  </p>
                )}

                <div className="mt-2.5 grid grid-cols-2 gap-2 text-[10px] text-gray-600">
                  <div>
                    <span className="text-gray-400">Priority: </span>
                    <span className="font-medium text-gray-800">{activity.priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">When: </span>
                    <span className="font-medium text-gray-800">{getRelativeDate(activity.activityDate)}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-gray-100 pt-2.5">
                  <button
                    onClick={() => onView(activity)}
                    className="em-icon-btn em-icon-view"
                    title="View"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(activity)}
                    className="em-icon-btn em-icon-edit"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(activity._id)}
                    className="em-icon-btn em-icon-delete"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-[#FAFAFA]/60 flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="text-[10px] text-gray-500 font-medium">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} activities
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-[30px] px-2.5 border border-gray-200 rounded-[8px] text-[10px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>

            <div className="flex gap-1.5">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="h-[30px] px-3 border border-gray-200 rounded-full text-[10px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="h-[30px] px-3 border border-gray-200 rounded-full text-[10px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesTable;
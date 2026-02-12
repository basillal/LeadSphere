import React, { useState } from "react";

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
  onPageChange,
  onLimitChange,
}) => {
  const [selectedActivities, setSelectedActivities] = useState([]);

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

  const getStatusColor = (status) => {
    const colors = {
      Completed: "bg-green-100 text-green-800",
      Scheduled: "bg-blue-100 text-blue-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "bg-gray-100 text-gray-600",
      Medium: "bg-blue-100 text-blue-600",
      High: "bg-orange-100 text-orange-600",
      Urgent: "bg-red-100 text-red-600",
    };
    return colors[priority] || "bg-gray-100 text-gray-600";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Quick Date Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", value: "" },
            { label: "Today", value: "today" },
            { label: "Tomorrow", value: "tomorrow" },
            { label: "This Week", value: "thisWeek" },
            { label: "This Month", value: "thisMonth" },
            { label: "Overdue", value: "overdue" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => onDateFilterChange(filter.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filters.dateFilter === filter.value
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {/* Custom Date Range Picker */}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <label htmlFor="startDate" className="text-gray-600">
            From:
          </label>
          <input
            type="date"
            id="startDate"
            value={dateRange.startDate || ""}
            onChange={(e) => onDateRangeChange("startDate", e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-transparent"
          />
          <label htmlFor="endDate" className="text-gray-600">
            To:
          </label>
          <input
            type="date"
            id="endDate"
            value={dateRange.endDate || ""}
            onChange={(e) => onDateRangeChange("endDate", e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      {/* Header with Search and Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search activities..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>

          {/* Activity Type Filter */}
          <select
            value={filters.activityType || ""}
            onChange={(e) => onFilterChange("activityType", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Create Button */}
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            <span className="hidden md:inline">New Activity</span>
            <span className="md:hidden">Create</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedActivities.length === activities.length &&
                    activities.length > 0
                  }
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Related To
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activities.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  No activities found. Create your first activity!
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
                    ? "border-l-4 border-l-blue-500 bg-blue-50/30"
                    : dateContext === "overdue"
                      ? "border-l-4 border-l-red-500 bg-red-50/30"
                      : "";

                return (
                  <tr
                    key={activity._id}
                    className={`hover:bg-gray-50 transition-colors ${borderClass}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity._id)}
                        onChange={() => handleSelectActivity(activity._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-2xl">
                        {getActivityTypeIcon(activity.activityType)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 uppercase">
                        {activity.title}
                      </div>
                      {activity.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {activity.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {activity.relatedName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {activity.relatedTo}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div
                          className={`font-medium ${dateContext === "today" ? "text-blue-600 font-bold" : dateContext === "overdue" ? "text-red-600 font-bold" : "text-gray-900"}`}
                        >
                          {getRelativeDate(activity.activityDate)}
                        </div>
                        {activity.startTime && (
                          <div className="text-xs text-gray-500">
                            {activity.startTime}
                          </div>
                        )}
                        {dateContext === "overdue" && (
                          <div className="mt-1">
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-semibold">
                              Overdue
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(activity.priority)}`}
                      >
                        {activity.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onView(activity)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
      <div className="md:hidden divide-y divide-gray-200">
        {activities.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No activities found. Create your first activity!
          </div>
        ) : (
          activities.map((activity) => {
            const dateContext = getDateContext(
              activity.activityDate,
              activity.status,
            );
            const borderClass =
              dateContext === "today"
                ? "border-l-4 border-l-blue-500 bg-blue-50/30"
                : dateContext === "overdue"
                  ? "border-l-4 border-l-red-500 bg-red-50/30"
                  : "";

            return (
              <div
                key={activity._id}
                className={`p-4 hover:bg-gray-50 ${borderClass}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getActivityTypeIcon(activity.activityType)}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {activity.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activity.relatedName} • {activity.relatedTo}
                      </div>
                    </div>
                  </div>
                </div>

                {activity.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {activity.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}
                  >
                    {activity.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(activity.priority)}`}
                  >
                    {activity.priority}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      dateContext === "today"
                        ? "bg-blue-100 text-blue-800"
                        : dateContext === "overdue"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {getRelativeDate(activity.activityDate)}
                  </span>
                  {dateContext === "overdue" && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                      Overdue
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onView(activity)}
                    className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(activity)}
                    className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(activity._id)}
                    className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} activities
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            <div className="flex gap-1">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

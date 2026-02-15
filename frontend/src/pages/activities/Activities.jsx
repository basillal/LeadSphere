import React, { useState, useEffect, useCallback } from "react";
import activityService from "../../services/activityService";
import ActivityStats from "./ActivityStats";
import ActivitiesTable from "./ActivitiesTable";
import ActivityForm from "./ActivityForm";
import Toast from "../../components/common/utils/Toast";

// Preview Modal Component
const PreviewModal = ({ activity, onClose }) => {
  if (!activity) return null;

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
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {getActivityTypeIcon(activity.activityType)}
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activity.title}
              </h2>
              <p className="text-sm text-gray-500">
                {activity.activityType} • {activity.relatedName} (
                {activity.relatedTo})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(activity.status)}`}
            >
              {activity.status}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(activity.priority)}`}
            >
              {activity.priority}
            </span>
            {activity.category && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                {activity.category}
              </span>
            )}
            {activity.outcome && activity.outcome !== "None" && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                {activity.outcome}
              </span>
            )}
          </div>

          {/* Description */}
          {activity.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Description
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed border border-gray-100">
                {activity.description}
              </p>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900 rounded-xl text-white">
            <div>
              <div className="text-xs text-gray-400 uppercase">Date</div>
              <div className="text-sm font-bold">
                {formatDate(activity.activityDate)}
              </div>
            </div>
            {activity.startTime && (
              <div>
                <div className="text-xs text-gray-400 uppercase">
                  Start Time
                </div>
                <div className="text-sm font-bold">{activity.startTime}</div>
              </div>
            )}
            {activity.endTime && (
              <div>
                <div className="text-xs text-gray-400 uppercase">End Time</div>
                <div className="text-sm font-bold">{activity.endTime}</div>
              </div>
            )}
          </div>

          {/* Call Details */}
          {activity.activityType === "Call" && activity.callDetails && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Call Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {activity.callDetails.duration && (
                  <div>
                    <span className="font-semibold text-gray-500">
                      Duration:
                    </span>{" "}
                    {activity.callDetails.duration}
                  </div>
                )}
                {activity.callDetails.callType && (
                  <div>
                    <span className="font-semibold text-gray-500">Type:</span>{" "}
                    {activity.callDetails.callType}
                  </div>
                )}
                {activity.callDetails.callStatus && (
                  <div>
                    <span className="font-semibold text-gray-500">Status:</span>{" "}
                    {activity.callDetails.callStatus}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meeting Details */}
          {activity.activityType === "Meeting" && activity.meetingDetails && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Meeting Details
              </h3>
              <div className="space-y-2">
                {activity.meetingDetails.location && (
                  <p>
                    <span className="font-semibold text-gray-500">
                      Location:
                    </span>{" "}
                    {activity.meetingDetails.location}
                  </p>
                )}
                {activity.meetingDetails.meetingType && (
                  <p>
                    <span className="font-semibold text-gray-500">Type:</span>{" "}
                    {activity.meetingDetails.meetingType}
                  </p>
                )}
                {activity.meetingDetails.agenda && (
                  <div>
                    <span className="font-semibold text-gray-500">Agenda:</span>
                    <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {activity.meetingDetails.agenda}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {activity.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Notes
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed border border-gray-100">
                {activity.notes}
              </p>
            </div>
          )}

          {/* Follow-up */}
          {activity.followUpRequired && (
            <div className="space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wider">
                Follow-up Required
              </h3>
              {activity.followUpDate && (
                <p className="text-gray-700">
                  <span className="font-semibold">Date:</span>{" "}
                  {formatDate(activity.followUpDate)}
                </p>
              )}
              {activity.followUpNotes && (
                <p className="text-gray-700">
                  <span className="font-semibold">Notes:</span>{" "}
                  {activity.followUpNotes}
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {activity.attachments && activity.attachments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Attachments
              </h3>
              <div className="space-y-2">
                {activity.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-2xl">📎</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {attachment.fileName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {attachment.fileType}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const Activities = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    callLogs: 0,
    meetings: 0,
    notes: 0,
    emails: 0,
    recentActivities: 0,
    pendingFollowUps: 0,
    todaysActivities: 0,
    overdueActivities: 0,
  });
  // const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list"); // 'list', 'create', 'edit'
  const [currentActivity, setCurrentActivity] = useState(null);
  const [previewActivity, setPreviewActivity] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filters, setFilters] = useState({
    search: "",
    activityType: "",
    status: "",
    dateFilter: "today",
  });
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchActivities = useCallback(async () => {
    // setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.dateFilter) params.dateFilter = filters.dateFilter;

      if (activeTab !== "all") {
        params.activityType = activeTab;
      } else if (filters.activityType) {
        params.activityType = filters.activityType;
      }

      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }

      const response = await activityService.getActivities(params);
      setActivities(response.data);
      if (response.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total || 0,
          pages: response.pagination.pages || 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      showSnackbar("Failed to fetch activities", "error");
    } finally {
      // setLoading(false);
    }
  }, [filters, activeTab, pagination.page, pagination.limit, dateRange]);

  const fetchStats = async () => {
    try {
      const response = await activityService.getActivityStats();
      setStats(response.data);
    } catch (error) {
      // Fail silently for background stats
      console.warn("Failed to fetch activity stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivities();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchActivities]);

  const handleCreate = () => {
    setCurrentActivity(null);
    setView("create");
  };

  const handleEdit = (activity) => {
    setCurrentActivity(activity);
    setView("edit");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await activityService.deleteActivity(id);
        showSnackbar("Activity deleted successfully", "success");
        fetchActivities();
        fetchStats();
      } catch (error) {
        console.error("Error deleting activity:", error);
        showSnackbar("Failed to delete activity", "error");
      }
    }
  };

  const handleView = (activity) => {
    setPreviewActivity(activity);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (currentActivity) {
        await activityService.updateActivity(currentActivity._id, data);
        showSnackbar("Activity updated successfully", "success");
      } else {
        await activityService.createActivity(data);
        showSnackbar("Activity created successfully", "success");
      }
      setView("list");
      setCurrentActivity(null);
      fetchActivities();
      fetchStats();
    } catch (error) {
      console.error("Error saving activity:", error);
      const errMsg = error.response?.data?.message || "Failed to save activity";
      showSnackbar(errMsg, "error");
    }
  };

  const handleCancelForm = () => {
    setView("list");
    setCurrentActivity(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const handleDateFilterChange = (dateFilter) => {
    setFilters((prev) => ({ ...prev, dateFilter }));
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Reset date range if not custom
    if (dateFilter !== "custom") {
      setDateRange({ startDate: "", endDate: "" });
    }
  };

  const handleDateRangeChange = (key, value) => {
    setDateRange((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatClick = (filter) => {
    handleDateFilterChange(filter);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination({
      page: 1,
      limit: newLimit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / newLimit),
    });
  };

  const tabs = [
    { id: "all", label: "All Activities" },
    { id: "Call", label: "📞 Calls" },
    { id: "Meeting", label: "🤝 Meetings" },
    { id: "Email", label: "✉️ Emails" },
    { id: "Note", label: "📝 Notes" },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {view === "list"
            ? "Activities"
            : view === "create"
              ? "Create New Activity"
              : "Edit Activity"}
        </h1>
        {view !== "list" && (
          <button
            onClick={handleCancelForm}
            className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            title="Back to List"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* {loading && view === "list" ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : ( */}
      <>
        {view === "list" && (
          <>
            {/* Stats */}
            <ActivityStats stats={stats} onStatClick={handleStatClick} />

            {/* Tabs */}
            <div className="mb-4 md:mb-6 -mx-4 md:mx-0 px-4 md:px-0">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full md:w-fit overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities Table */}
            <div className="pb-20">
              <ActivitiesTable
                activities={activities}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                filters={filters}
                onFilterChange={handleFilterChange}
                onDateFilterChange={handleDateFilterChange}
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                pagination={pagination}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </div>
          </>
        )}

        {(view === "create" || view === "edit") && (
          <div className="max-w-7xl mx-auto">
            <ActivityForm
              key={currentActivity ? currentActivity._id : "new"}
              initialData={currentActivity}
              onSubmit={view === "create" ? handleFormSubmit : handleFormSubmit}
              onCancel={handleCancelForm}
            />
          </div>
        )}
      </>

      {/* Preview Modal */}
      <PreviewModal
        activity={previewActivity}
        onClose={() => setPreviewActivity(null)}
      />

      {/* Toast */}
      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default Activities;

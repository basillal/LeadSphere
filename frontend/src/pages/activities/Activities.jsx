import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import activityService from "../../services/activityService";
import ActivityStats from "./ActivityStats";
import ActivitiesTable from "./ActivitiesTable";
import ActivityForm from "./ActivityForm";
import leadCategoryService from "../../services/leadCategoryService"; // New import
import { useData } from "../../context/DataContext";
import Toast from "../../components/common/utils/Toast";
import TimeRangeFilter, { getDateRange } from "../../components/common/TimeRangeFilter";
import StatsWrapper from "../../components/common/sections/StatsWrapper";
import { formatDate } from "../../utils/dateUtils";

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
    return colors[status] || "bg-slate-100 text-black";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "bg-slate-100 text-black",
      Medium: "bg-blue-100 text-blue-600",
      High: "bg-orange-100 text-orange-600",
      Urgent: "bg-red-100 text-red-600",
    };
    return colors[priority] || "bg-slate-100 text-black";
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm font-inter">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className="relative bg-white border border-gray-100 rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[85vh] max-h-[85dvh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 m-0">
                {activity.title}
              </h2>
              <p className="text-[10px] text-gray-500 m-0 mt-0.5">
                {activity.activityType} • {activity.relatedName} ({activity.relatedTo})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 rounded-full text-base font-medium ${getStatusColor(activity.status)}`}
            >
              {activity.status}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-base font-medium ${getPriorityColor(activity.priority)}`}
            >
              {activity.priority}
            </span>
            {activity.category && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-base font-medium">
                {activity.category}
              </span>
            )}
            {activity.outcome && activity.outcome !== "None" && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-base font-medium">
                {activity.outcome}
              </span>
            )}
          </div>

          {/* Description */}
          {activity.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider">
                Description
              </h3>
              <p className="text-black bg-slate-50 p-4 rounded-lg leading-relaxed border border-slate-200">
                {activity.description}
              </p>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900 rounded-md text-white">
            <div>
              <div className="text-base text-black uppercase">Date</div>
              <div className="text-base font-medium">
                {formatDate(activity.activityDate)}
              </div>
            </div>
            {activity.startTime && (
              <div>
                <div className="text-base text-black uppercase">
                  Start Time
                </div>
                <div className="text-base font-medium">{activity.startTime}</div>
              </div>
            )}
            {activity.endTime && (
              <div>
                <div className="text-base text-black uppercase">End Time</div>
                <div className="text-base font-medium">{activity.endTime}</div>
              </div>
            )}
          </div>

          {/* Call Details */}
          {activity.activityType === "Call" && activity.callDetails && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider">
                Call Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {activity.callDetails.duration && (
                  <div>
                    <span className="font-medium text-black">
                      Duration:
                    </span>{" "}
                    {activity.callDetails.duration}
                  </div>
                )}
                {activity.callDetails.callType && (
                  <div>
                    <span className="font-medium text-black">Type:</span>{" "}
                    {activity.callDetails.callType}
                  </div>
                )}
                {activity.callDetails.callStatus && (
                  <div>
                    <span className="font-medium text-black">Status:</span>{" "}
                    {activity.callDetails.callStatus}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meeting Details */}
          {activity.activityType === "Meeting" && activity.meetingDetails && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider">
                Meeting Details
              </h3>
              <div className="space-y-2">
                {activity.meetingDetails.location && (
                  <p>
                    <span className="font-medium text-black">
                      Location:
                    </span>{" "}
                    {activity.meetingDetails.location}
                  </p>
                )}
                {activity.meetingDetails.meetingType && (
                  <p>
                    <span className="font-medium text-black">Type:</span>{" "}
                    {activity.meetingDetails.meetingType}
                  </p>
                )}
                {activity.meetingDetails.agenda && (
                  <div>
                    <span className="font-medium text-black">Agenda:</span>
                    <p className="mt-1 text-black bg-slate-50 p-3 rounded-lg">
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
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider">
                Notes
              </h3>
              <p className="text-black bg-slate-50 p-4 rounded-lg leading-relaxed border border-slate-200">
                {activity.notes}
              </p>
            </div>
          )}

          {/* Follow-up */}
          {activity.followUpRequired && (
            <div className="space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-base font-medium text-yellow-800 uppercase tracking-wider">
                Follow-up Required
              </h3>
              {activity.followUpDate && (
                <p className="text-black">
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(activity.followUpDate)}
                </p>
              )}
              {activity.followUpNotes && (
                <p className="text-black">
                  <span className="font-medium">Notes:</span>{" "}
                  {activity.followUpNotes}
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 text-black rounded-full text-base font-medium"
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
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider">
                Attachments
              </h3>
              <div className="space-y-2">
                {activity.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <span className="text-base">📎</span>
                    <div className="flex-1">
                      <div className="font-medium text-black">
                        {attachment.fileName}
                      </div>
                      <div className="text-base text-black">
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
        <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="em-btn-clear"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const Activities = () => {
  const { selectedOrganization } = useAuth();
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
    category: "", // Added category filter
  });
  const { categories } = useData();
  const [timeRange, setTimeRange] = useState("last_30_days");

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
      if (filters.category) params.category = filters.category; // Added category param

      if (activeTab !== "all") {
        params.activityType = activeTab;
      } else if (filters.activityType) {
        params.activityType = filters.activityType;
      }

      // Add Global Time Range Filter
      const range = getDateRange(timeRange);
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

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
    }
  }, [
    filters,
    activeTab,
    pagination.page,
    pagination.limit,
    selectedOrganization,
    timeRange
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      const range = getDateRange(timeRange);
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;
      
      const response = await activityService.getActivityStats(params);
      setStats(response.data);
    } catch (error) {
      // Fail silently for background stats
      console.warn("Failed to fetch activity stats:", error);
    }
  }, [timeRange, selectedOrganization]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRangeChange = () => {
    // Fetches are triggered by the useEffect depending on timeRange
  };

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
        const payload = { ...data };
        if (selectedOrganization) {
          payload.organization = selectedOrganization;
        }
        await activityService.createActivity(payload);
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

  const handleStatClick = (filter) => {
    if (filter === "Call" || filter === "Meeting" || filter === "Email") {
      setActiveTab(filter);
    } else if (filter === "overdue") {
      setFilters((prev) => ({ ...prev, status: "Scheduled" }));
    } else if (filter === "today") {
      setTimeRange("today");
    }
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
    { id: "all", label: "All Activities", icon: "⚡" },
    { id: "Call", label: "Calls Logged", icon: "📞" },
    { id: "Meeting", label: "Meetings & Demos", icon: "🤝" },
    { id: "Email", label: "Emails", icon: "✉️" },
    { id: "Note", label: "Notes & Memos", icon: "📝" },
    { id: "Task", label: "Tasks", icon: "✅" },
  ];

  return (
    <div className="w-full font-inter">
      {/* Header Block & Spacing Hierarchy */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-[13px] font-semibold text-gray-900 m-0">
              {view === "list"
                ? "Activity Log"
                : view === "create"
                  ? "Schedule Activity"
                  : "Edit Activity Details"}
            </h1>
            <p className="text-[10.5px] text-gray-500 m-0 mt-0.5">
              {view === "list"
                ? "Track sales calls, team meetings, notes, and task progress across contacts and leads."
                : "Schedule customer touchpoints, agenda items, and assigned deadlines."}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {view === "list" ? (
              <>
                <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
                <button
                  type="button"
                  onClick={() => setView("create")}
                  className="em-add"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                  <span>New Activity</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCancelForm}
                className="em-btn-clear"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                </svg>
                <span>Back to List</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {view === "list" && (
        <>
          <ActivityStats stats={stats} onStatClick={handleStatClick} />

          {/* Quick Filter Tabs */}
          <div className="mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <div className="flex items-center gap-1.5 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 h-[30px] px-3.5 rounded-full text-[10.5px] font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#111827] text-white shadow-sm"
                      : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]"
                  }`}
                >
                  <span className="text-[11.5px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

            {/* Activities Table */}
            <ActivitiesTable
              activities={activities}
              categories={categories} // Added categories prop
              onCreate={handleCreate}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              filters={filters}
              onFilterChange={handleFilterChange}
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
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

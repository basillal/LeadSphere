import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import followUpService from "../../services/followUpService";
import FollowUpForm from "./FollowUpForm";
import FollowUpStats from "./FollowUpStats";
import TimeRangeFilter, { getDateRange } from "../../components/common/TimeRangeFilter";
import StatsWrapper from "../../components/common/sections/StatsWrapper";
import Loader from "../../components/common/Loader";

const FollowUps = () => {
  const { selectedOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [followUps, setFollowUps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("last_30_days");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    upcoming: 0,
    pending: 0,
    completed: 0,
    missed: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [followUpToUpdate, setFollowUpToUpdate] = useState(null);
  const [outcomeRemark, setOutcomeRemark] = useState("");
  const [currentFollowUp, setCurrentFollowUp] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Fix: Properly handle tab-based filters
      if (activeTab === "today") {
        params.range = "today";
      } else if (activeTab === "upcoming") {
        params.range = "upcoming";
      } else if (activeTab === "missed") {
        params.range = "overdue";
      } else if (activeTab === "completed") {
        params.status = "Completed";
      }
      // "all" tab - don't add any filters

      const range = getDateRange(timeRange);
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

      // Add organization filter
      if (selectedOrganization) {
        params.organization = selectedOrganization;
      }

      const response = await followUpService.getFollowUps(params);
      setFollowUps(response.data || []);

      if (response.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total || 0,
          pages: response.pagination.pages || 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      setFollowUps([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit, selectedOrganization, timeRange]);

  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      const range = getDateRange(timeRange);
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

      if (selectedOrganization) {
        params.organization = selectedOrganization;
      }

      const response = await followUpService.getFollowUpStats(params);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [timeRange, selectedOrganization]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCreate = () => {
    setCurrentFollowUp(null);
    setIsFormOpen(true);
  };

  const handleEdit = (followUp) => {
    setCurrentFollowUp(followUp);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this follow-up?")) {
      setActionLoading(true);
      try {
        await followUpService.deleteFollowUp(id);
        await fetchFollowUps();
        await fetchStats();
      } catch (error) {
        console.error("Error deleting follow-up:", error);
        alert("Failed to delete follow-up. Please try again.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleStatusChange = async (followUp, newStatus) => {
    if (newStatus === "Completed") {
      setFollowUpToUpdate(followUp);
      setOutcomeRemark("");
      setIsOutcomeOpen(true);
      return;
    }

    setActionLoading(true);
    try {
      await followUpService.updateFollowUp(followUp._id, { status: newStatus });
      await fetchFollowUps();
      await fetchStats();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOutcomeSubmit = async (e) => {
    e.preventDefault();
    if (!outcomeRemark.trim()) {
      alert("Please provide an outcome remark.");
      return;
    }

    setActionLoading(true);
    try {
      await followUpService.updateFollowUp(followUpToUpdate._id, {
        status: "Completed",
        outcome: outcomeRemark,
      });
      setIsOutcomeOpen(false);
      setFollowUpToUpdate(null);
      setOutcomeRemark("");
      await fetchFollowUps();
      await fetchStats();
    } catch (error) {
      console.error("Error updating status with outcome:", error);
      alert("Failed to complete follow-up. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    setActionLoading(true);
    try {
      if (currentFollowUp) {
        await followUpService.updateFollowUp(currentFollowUp._id, data);
      } else {
        const payload = { ...data };
        if (selectedOrganization) {
          payload.organization = selectedOrganization;
        }
        await followUpService.createFollowUp(payload);
      }
      setIsFormOpen(false);
      await fetchFollowUps();
      await fetchStats();
    } catch (error) {
      console.error("Error saving follow-up:", error);
      alert("Failed to save follow-up. Please check if Lead field is valid.");
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: "all", label: "All Records", count: stats.total || 0, emoji: "📊" },
    { id: "today", label: "Today's Actions", count: stats.today || 0, emoji: "📅" },
    { id: "upcoming", label: "Upcoming", count: stats.upcoming || 0, emoji: "⏰" },
    { id: "missed", label: "Missed/Overdue", count: stats.missed || 0, emoji: "⚠️" },
    { id: "completed", label: "Completed", count: stats.completed || 0, emoji: "✅" },
  ];

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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const toggleExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Completed': 'bg-green-50 text-green-700 border-green-200',
      'Missed': 'bg-red-50 text-red-700 border-red-200',
      'Rescheduled': 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      'Pending': '⏳',
      'Completed': '✅',
      'Missed': '❌',
      'Rescheduled': '🔄'
    };
    return emojis[status] || '📌';
  };

  const getTypeEmoji = (type) => {
    const emojis = {
      'Call': '📞',
      'Email': '✉️',
      'Meeting': '👥',
      'Task': '📋'
    };
    return emojis[type] || '📌';
  };

  // FIX: Proper date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const diffTime = targetDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let dayLabel = '';
      if (diffDays < 0) {
        dayLabel = `${Math.abs(diffDays)}d overdue`;
      } else if (diffDays === 0) {
        dayLabel = 'Today';
      } else if (diffDays === 1) {
        dayLabel = 'Tomorrow';
      } else {
        dayLabel = `${diffDays}d`;
      }

      // Format time
      const timeStr = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return `${dayLabel} at ${timeStr}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getShortDate = (dateString) => {
    if (!dateString) return 'No date';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Filter follow-ups
  const filteredFollowUps = followUps.filter((followUp) => {
    const matchesSearch =
      !searchTerm ||
      (followUp.lead?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (followUp.lead?.phone || '').includes(searchTerm) ||
      (followUp.lead?.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || followUp.status === statusFilter;
    const matchesType = !typeFilter || followUp.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get current tab label for header
  const currentTab = tabs.find(tab => tab.id === activeTab);
  const tabLabel = currentTab ? currentTab.label : 'Follow-ups';

  return (
    <div className="w-full max-w-full bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>📋</span>
                {tabLabel}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track and manage your customer interactions
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
              <button
                onClick={handleCreate}
                disabled={actionLoading}
                className="bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 font-medium whitespace-nowrap shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>➕</span>
                <span className="hidden sm:inline">New Follow-up</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Tabs */}
        <div className="px-4 md:px-6 pb-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${isActive
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <span>{tab.emoji}</span>
                  <span className="text-sm font-medium">{tab.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 py-4">
        {/* Stats Overview */}
        <div className="mb-6">
          <StatsWrapper title="Overview">
            <FollowUpStats stats={stats} />
          </StatsWrapper>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span>🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search by lead name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 text-sm transition-all duration-200"
              />
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="md:hidden px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-between gap-2"
            >
              <span>🔽</span>
              <span>Filters</span>
              {filtersOpen ? <span>▲</span> : <span>▼</span>}
            </button>
            <div className={`${filtersOpen ? 'flex flex-col' : 'hidden'} md:flex md:flex-row gap-3`}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 text-sm min-w-[140px]"
              >
                <option value="">All Statuses</option>
                <option value="Pending">⏳ Pending</option>
                <option value="Completed">✅ Completed</option>
                <option value="Missed">❌ Missed</option>
                <option value="Rescheduled">🔄 Rescheduled</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 text-sm min-w-[140px]"
              >
                <option value="">All Types</option>
                <option value="Call">📞 Call</option>
                <option value="Email">✉️ Email</option>
                <option value="Meeting">👥 Meeting</option>
                <option value="Task">📋 Task</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-sm text-gray-500">
            Showing {filteredFollowUps.length} of {pagination.total} follow-ups
          </p>
          {filteredFollowUps.length > 0 && (
            <span className="text-sm text-gray-400">
              Page {pagination.page} of {pagination.pages}
            </span>
          )}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 relative min-h-[200px] w-full">
            <Loader local />
          </div>
        ) : filteredFollowUps.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No follow-ups found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter || typeFilter
                ? 'Try adjusting your filters to see more results'
                : 'Schedule your first follow-up to get started'}
            </p>
            {!searchTerm && !statusFilter && !typeFilter && (
              <button
                onClick={handleCreate}
                className="mt-4 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <span className="mr-2">➕</span>
                Create Follow-up
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredFollowUps.map((followUp) => {
              const isExpanded = expandedCard === followUp._id;
              const statusColor = getStatusColor(followUp.status);
              const statusEmoji = getStatusEmoji(followUp.status);
              const typeEmoji = getTypeEmoji(followUp.type);

              return (
                <div
                  key={followUp._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* Card Header - Click to expand */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(followUp._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {followUp.lead?.name || 'Unknown Lead'}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                            {statusEmoji} {followUp.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <span>{typeEmoji}</span>
                            <span>{followUp.type || 'N/A'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>📅</span>
                            <span>{formatDate(followUp.scheduledDate)}</span>
                          </span>
                        </div>
                      </div>
                      <button className="ml-2 p-1 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0">
                        {isExpanded ? <span>▲</span> : <span>▼</span>}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-4 border-t border-gray-100 bg-gray-50/30">
                      <div className="space-y-4">
                        {/* Lead Details */}
                        {followUp.lead && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">👤</div>
                              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Lead Information
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400 block text-xs mb-1 uppercase tracking-wide">Phone</span>
                                <p className="font-medium text-gray-900">{followUp.lead.phone || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-xs mb-1 uppercase tracking-wide">Email</span>
                                <p className="font-medium text-gray-900 truncate">{followUp.lead.email || 'N/A'}</p>
                              </div>
                              {followUp.lead.company && (
                                <div className="col-span-2 pt-3 border-t border-gray-50">
                                  <span className="text-gray-400 block text-xs mb-1 uppercase tracking-wide">Company</span>
                                  <p className="font-medium text-gray-900">{followUp.lead.company}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Schedule Details */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm">📅</div>
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Schedule Details
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400 block text-xs mb-1 uppercase tracking-wide">Date</span>
                              <p className="font-medium text-gray-900">{getShortDate(followUp.scheduledDate)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-xs mb-1 uppercase tracking-wide">Time</span>
                              <p className="font-medium text-gray-900">
                                {followUp.scheduledDate ?
                                  new Date(followUp.scheduledDate).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  }) :
                                  'N/A'
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {followUp.notes && (
                          <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm">📝</div>
                              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                                Notes
                              </p>
                            </div>
                            <p className="text-sm text-amber-800 leading-relaxed">{followUp.notes}</p>
                          </div>
                        )}

                        {/* Outcome */}
                        {followUp.outcome && (
                          <div className="bg-green-50/50 rounded-xl p-4 border border-green-100/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-green-100 text-green-700 rounded-lg text-sm">✅</div>
                              <p className="text-xs font-bold text-green-900 uppercase tracking-wider">
                                Outcome
                              </p>
                            </div>
                            <p className="text-sm text-green-800 leading-relaxed">{followUp.outcome}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {followUp.status !== 'Completed' && followUp.status !== 'Missed' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(followUp, 'Completed');
                                }}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span>✅</span>
                                Complete
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(followUp, 'Rescheduled');
                                }}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span>🔄</span>
                                Reschedule
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(followUp);
                            }}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span>✏️</span>
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(followUp._id);
                            }}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span>🗑️</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
              results
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ◀ Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pagination.page === pageNum
                          ? 'bg-gray-900 text-white'
                          : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || loading}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next ▶
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                disabled={loading}
                className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Centered Modal for Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsFormOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {currentFollowUp ? 'Edit Follow-up' : 'Schedule New Follow-up'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close modal</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <FollowUpForm
                initialData={currentFollowUp}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
                isLoading={actionLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Centered Modal for Outcome */}
      {isOutcomeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsOutcomeOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                Complete Follow-up
              </h2>
              <button
                onClick={() => setIsOutcomeOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close modal</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleOutcomeSubmit} className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-blue-800">
                    Marking follow-up as complete for{' '}
                    <span className="font-bold text-blue-900">{followUpToUpdate?.lead?.name}</span>
                  </p>
                  {followUpToUpdate && (
                    <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-2">
                      <span className="flex items-center gap-1"><span>📌</span> {followUpToUpdate.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><span>📅</span> {getShortDate(followUpToUpdate.scheduledDate)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Outcome / Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent min-h-[120px] resize-y bg-gray-50 transition-all"
                    placeholder="What was the result of this interaction?"
                    value={outcomeRemark}
                    onChange={(e) => setOutcomeRemark(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsOutcomeOpen(false)}
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-black text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? '⏳ Processing...' : '✅ Complete'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUps;
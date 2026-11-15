import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import followUpService from "../../services/followUpService";
import FollowUpForm from "./FollowUpForm";
import FollowUpStats from "./FollowUpStats";
import TimeRangeFilter, { getDateRange } from "../../components/common/TimeRangeFilter";

const FollowUps = () => {
  const { selectedOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [followUps, setFollowUps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [timeRange, setTimeRange] = useState("all_time");
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
  const [previewFollowUp, setPreviewFollowUp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (activeTab === "today") {
        params.range = "today";
      } else if (activeTab === "upcoming") {
        params.range = "upcoming";
      } else if (activeTab === "missed") {
        params.range = "overdue";
      } else if (activeTab === "completed") {
        params.status = "Completed";
      }

      const range = getDateRange(timeRange);
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

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
    setPreviewFollowUp(null);
    setCurrentFollowUp(followUp);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this follow-up?")) {
      setActionLoading(true);
      try {
        await followUpService.deleteFollowUp(id);
        if (previewFollowUp?._id === id) {
          setPreviewFollowUp(null);
        }
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
      setPreviewFollowUp(null);
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
      if (previewFollowUp?._id === followUp._id) {
        setPreviewFollowUp((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
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
        outcome: outcomeRemark.trim(),
      });
      setIsOutcomeOpen(false);
      setFollowUpToUpdate(null);
      setOutcomeRemark("");
      await fetchFollowUps();
      await fetchStats();
    } catch (error) {
      console.error("Error completing follow-up:", error);
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
      setCurrentFollowUp(null);
      await fetchFollowUps();
      await fetchStats();
    } catch (error) {
      console.error("Error saving follow-up:", error);
      alert("Failed to save follow-up. Please check that all required fields are valid.");
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: "all", label: "All Records", count: stats.total || 0 },
    { id: "today", label: "Today's Actions", count: stats.today || 0 },
    { id: "upcoming", label: "Upcoming", count: stats.upcoming || 0 },
    { id: "missed", label: "Missed / Overdue", count: stats.missed || 0 },
    { id: "completed", label: "Completed", count: stats.completed || 0 },
  ];

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
      limit: newLimit,
      pages: Math.max(1, Math.ceil(prev.total / newLimit)),
    }));
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const diffTime = targetDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let dayLabel = "";
      if (diffDays < 0) {
        dayLabel = `${Math.abs(diffDays)}d overdue`;
      } else if (diffDays === 0) {
        dayLabel = "Today";
      } else if (diffDays === 1) {
        dayLabel = "Tomorrow";
      } else {
        dayLabel = `${diffDays}d away`;
      }

      const timeStr = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return `${dayLabel} at ${timeStr}`;
    } catch {
      return "Invalid date";
    }
  };

  const getShortDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]";
      case "Pending":
        return "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]";
      case "Missed":
        return "bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]";
      case "Rescheduled":
        return "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]";
      default:
        return "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Call":
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case "Email":
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case "Meeting":
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case "WhatsApp":
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
    }
  };

  const filteredFollowUps = followUps.filter((followUp) => {
    const matchesSearch =
      !searchTerm ||
      (followUp.lead?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (followUp.lead?.phone || "").includes(searchTerm) ||
      (followUp.lead?.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || followUp.status === statusFilter;
    const matchesType = !typeFilter || followUp.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <main className="w-full max-w-[1400px] mx-auto relative px-0 sm:px-2 pt-0 pb-6 font-inter">
      {/* Header Block & Spacing Hierarchy */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-[13px] font-semibold text-gray-900 m-0">
              Follow-up Management
            </h1>
            <p className="text-[10.5px] text-gray-500 m-0 mt-0.5">
              Track and resolve client schedules, communication tasks, and outcome notes.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
            <button
              type="button"
              onClick={handleCreate}
              disabled={actionLoading}
              className="em-add"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
              <span>New Follow-up</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <FollowUpStats stats={stats} />

      {/* Quick Filter Tabs */}
      <div className="mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 h-[30px] px-3.5 rounded-full text-[10.5px] font-medium transition-all ${
                  isActive
                    ? "bg-[#111827] text-white shadow-sm"
                    : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        {/* Search on left */}
        <div className="search-bar">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by client name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[34px] pl-9 pr-3 text-[11px] text-gray-900 bg-white border border-gray-200 rounded-full outline-none focus:border-gray-400 placeholder:text-[#9CA3AF]"
            />
            <svg
              className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="1.8" />
              <path d="m21 21-4.3-4.3" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Filters and Actions on right */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[34px] px-3 text-[11px] font-medium text-[#111827] bg-white border border-[#E2E8F0] rounded-full outline-none hover:border-gray-400 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Missed">Missed</option>
            <option value="Rescheduled">Rescheduled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-[34px] px-3 text-[11px] font-medium text-[#111827] bg-white border border-[#E2E8F0] rounded-full outline-none hover:border-gray-400 transition-colors"
          >
            <option value="">All Types</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Task">Task</option>
          </select>

          {(searchTerm || statusFilter || typeFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setTypeFilter("");
              }}
              className="em-btn-clear"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Card Content */}
      <div className="em-card">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="sk h-10 w-full rounded-[10px]" />
            ))}
          </div>
        ) : filteredFollowUps.length === 0 ? (
          <div className="py-14 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#E2E8F0]/60 flex items-center justify-center text-[#94A3B8] mb-3.5">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[14px] font-semibold text-[#111827] m-0 mb-1">
              No follow-ups found
            </h3>
            <p className="text-[11px] text-[#64748B] max-w-xs m-0 mb-4">
              {searchTerm || statusFilter || typeFilter
                ? "Try adjusting your search criteria or resetting filters to find matching records."
                : "Schedule your first client follow-up to begin tracking interactions."}
            </p>
            {!searchTerm && !statusFilter && !typeFilter && (
              <button type="button" onClick={handleCreate} className="em-add">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                <span>New Follow-up</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5] border-b border-gray-100 bg-white whitespace-nowrap select-none">
                      Lead / Client
                    </th>
                    <th className="px-4 py-2.5 text-left text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5] border-b border-gray-100 bg-white whitespace-nowrap select-none">
                      Type
                    </th>
                    <th className="px-4 py-2.5 text-left text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5] border-b border-gray-100 bg-white whitespace-nowrap select-none">
                      Scheduled Time
                    </th>
                    <th className="px-4 py-2.5 text-left text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5] border-b border-gray-100 bg-white whitespace-nowrap select-none">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-right text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5] border-b border-gray-100 bg-white whitespace-nowrap select-none">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFollowUps.map((item) => {
                    const leadName = item.lead?.name || "Unassigned Lead";
                    const initial = leadName.charAt(0).toUpperCase();

                    return (
                      <tr
                        key={item._id}
                        onClick={() => setPreviewFollowUp(item)}
                        className="hover:bg-[#FCFCFC] transition-colors cursor-pointer border-t border-gray-100"
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#FFF1EB] text-[var(--primary)] text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                              {initial}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-semibold text-[#111827] truncate">
                                {leadName}
                              </span>
                              <span className="text-[9.5px] text-[#8B92A5] truncate">
                                {item.lead?.company || item.lead?.phone || item.lead?.email || "No contact info"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] font-medium bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
                            {getTypeIcon(item.type)}
                            <span>{item.type || "Call"}</span>
                          </span>
                        </td>

                        <td className="px-4 py-2 text-[10.5px] text-[#374151] whitespace-nowrap">
                          {formatDate(item.scheduledAt)}
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>

                        <td className="px-4 py-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setPreviewFollowUp(item)}
                              className="em-icon-btn em-icon-view"
                              title="View Details"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>

                            {item.status !== "Completed" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item, "Completed")}
                                className="em-icon-btn text-[#16A34A] hover:bg-[#DCFCE7]"
                                title="Mark as Completed"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="em-icon-btn em-icon-edit"
                              title="Edit Follow-up"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item._id)}
                              className="em-icon-btn em-icon-delete"
                              title="Delete"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-List Transformation */}
            <div className="block sm:hidden divide-y divide-gray-100">
              {filteredFollowUps.map((item) => {
                const leadName = item.lead?.name || "Unassigned Lead";
                const initial = leadName.charAt(0).toUpperCase();

                return (
                  <div
                    key={item._id}
                    onClick={() => setPreviewFollowUp(item)}
                    className="p-3.5 hover:bg-[#FCFCFC] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#FFF1EB] text-[var(--primary)] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {initial}
                        </div>
                        <div>
                          <h4 className="text-[11px] font-semibold text-[#111827] m-0">
                            {leadName}
                          </h4>
                          <span className="text-[9.5px] text-[#8B92A5]">
                            {item.lead?.company || item.lead?.phone || "No contact"}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1">
                      <span className="flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        <span>{item.type}</span>
                        <span>•</span>
                        <span>{formatDate(item.scheduledAt)}</span>
                      </span>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="em-icon-btn em-icon-edit"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="em-icon-btn em-icon-delete"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="px-4 py-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-[#FAFAFA]/60">
                <span className="text-[10px] text-[#64748B]">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} records
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="h-[30px] px-2.5 text-[10.5px] font-medium rounded-lg border border-[#E2E8F0] bg-white text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>

                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, idx) => {
                    let pageNum;
                    if (pagination.pages <= 5) pageNum = idx + 1;
                    else if (pagination.page <= 3) pageNum = idx + 1;
                    else if (pagination.page >= pagination.pages - 2)
                      pageNum = pagination.pages - 4 + idx;
                    else pageNum = pagination.page - 2 + idx;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`w-[30px] h-[30px] rounded-lg text-[10.5px] font-medium transition-colors ${
                          pagination.page === pageNum
                            ? "bg-[#111827] text-white"
                            : "bg-white border border-[#E2E8F0] text-[#4B5563] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages || loading}
                    className="h-[30px] px-2.5 text-[10.5px] font-medium rounded-lg border border-[#E2E8F0] bg-white text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>

                  <select
                    value={pagination.limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    disabled={loading}
                    className="h-[30px] px-2 text-[10.5px] rounded-lg border border-[#E2E8F0] bg-white text-[#4B5563] outline-none ml-2"
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Dialog: Schedule / Edit Follow-up */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col w-full max-w-[540px] max-h-[85vh] max-h-[85dvh] bg-white border border-gray-100 rounded-[24px] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-[14px] font-semibold text-gray-900 m-0">
                  {currentFollowUp ? "Edit Follow-up" : "Schedule New Follow-up"}
                </h2>
                <p className="text-[10px] text-gray-500 m-0 mt-0.5">
                  Plan client communications, agenda items, and assigned deadlines.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 px-6 py-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
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

      {/* Modal Dialog: Complete Follow-up / Outcome */}
      {isOutcomeOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col w-full max-w-[480px] max-h-[85vh] max-h-[85dvh] bg-white border border-gray-100 rounded-[24px] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-[14px] font-semibold text-gray-900 m-0">
                  Record Outcome
                </h2>
                <p className="text-[10px] text-gray-500 m-0 mt-0.5">
                  Conclude this follow-up by saving results and next-step notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOutcomeOpen(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleOutcomeSubmit} className="flex-1 flex flex-col justify-between">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="p-3 bg-[#F8FAFC] rounded-[12px] border border-[#E2E8F0]">
                  <span className="text-[9.5px] uppercase tracking-[0.08em] font-semibold text-[#8B92A5] block mb-0.5">
                    Lead Interaction
                  </span>
                  <p className="text-[11px] font-semibold text-[#111827] m-0">
                    {followUpToUpdate?.lead?.name || "Client"}
                  </p>
                  <p className="text-[9.5px] text-[#64748B] m-0 mt-0.5">
                    {followUpToUpdate?.type} • Scheduled for {getShortDate(followUpToUpdate?.scheduledAt)}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-[#4A5565] mb-1 block">
                    Outcome / Interaction Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={outcomeRemark}
                    onChange={(e) => setOutcomeRemark(e.target.value)}
                    placeholder="Enter call notes, client decisions, or next scheduled action..."
                    className="w-full p-2.5 text-[11px] text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none min-h-[90px] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setIsOutcomeOpen(false)}
                  disabled={actionLoading}
                  className="em-btn-clear"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="em-add"
                >
                  {actionLoading ? "Saving..." : "Mark Completed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog: Preview Follow-up Details */}
      {previewFollowUp && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col w-full max-w-[560px] max-h-[85vh] max-h-[85dvh] bg-white border border-gray-100 rounded-[24px] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-[14px] font-semibold text-gray-900 m-0">
                  Follow-up Details
                </h2>
                <p className="text-[10px] text-gray-500 m-0 mt-0.5">
                  Detailed inspection of scheduled client interaction.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFollowUp(null)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4" style={{ scrollbarWidth: "none" }}>
              {/* Lead Card */}
              <div className="bg-[#F8FAFC] rounded-[16px] p-4 border border-[#E2E8F0]">
                <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-[#8B92A5] block mb-2">
                  Client Information
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9.5px] text-[#64748B] block">Client Name</span>
                    <span className="text-[11px] font-semibold text-[#111827]">
                      {previewFollowUp.lead?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#64748B] block">Company</span>
                    <span className="text-[11px] font-semibold text-[#111827]">
                      {previewFollowUp.lead?.company || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#64748B] block">Phone</span>
                    <span className="text-[11px] font-semibold text-[#111827]">
                      {previewFollowUp.lead?.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#64748B] block">Email</span>
                    <span className="text-[11px] font-semibold text-[#111827] truncate block">
                      {previewFollowUp.lead?.email || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="bg-white rounded-[16px] p-4 border border-[#E2E8F0]">
                <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-[#8B92A5] block mb-2">
                  Schedule Overview
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9.5px] text-[#64748B] block">Current Status</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold mt-1 ${getStatusBadge(previewFollowUp.status)}`}>
                      {previewFollowUp.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#64748B] block">Interaction Type</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] font-medium bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] mt-1">
                      {getTypeIcon(previewFollowUp.type)}
                      <span>{previewFollowUp.type || "Call"}</span>
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9.5px] text-[#64748B] block">Scheduled Time</span>
                    <span className="text-[11px] font-medium text-[#111827]">
                      {formatDate(previewFollowUp.scheduledAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {previewFollowUp.notes && (
                <div className="bg-[#FFFBEB] rounded-[16px] p-4 border border-[#FDE68A]">
                  <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-[#B45309] block mb-1">
                    Agenda &amp; Notes
                  </span>
                  <p className="text-[10.5px] text-[#92400E] leading-relaxed m-0 whitespace-pre-wrap">
                    {previewFollowUp.notes}
                  </p>
                </div>
              )}

              {/* Outcome */}
              {previewFollowUp.outcome && (
                <div className="bg-[#F0FDF4] rounded-[16px] p-4 border border-[#BBF7D0]">
                  <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-[#15803D] block mb-1">
                    Concluded Outcome
                  </span>
                  <p className="text-[10.5px] text-[#166534] leading-relaxed m-0 whitespace-pre-wrap">
                    {previewFollowUp.outcome}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
              {previewFollowUp.status !== "Completed" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(previewFollowUp, "Completed")}
                  disabled={actionLoading}
                  className="em-add"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Complete</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleEdit(previewFollowUp)}
                disabled={actionLoading}
                className="em-btn-clear"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(previewFollowUp._id)}
                disabled={actionLoading}
                className="em-btn-clear text-[#DC2626] hover:text-[#DC2626] hover:bg-[#FEE2E2]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default FollowUps;

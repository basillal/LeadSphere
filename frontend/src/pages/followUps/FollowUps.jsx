import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import followUpService from "../../services/followUpService";
import FollowUpForm from "./FollowUpForm";
import FollowUpStats from "./FollowUpStats";
import TimeRangeFilter, { getDateRange } from "../../components/common/TimeRangeFilter";
import { formatDate as formatDateUtil, formatDateTime, formatTime } from "../../utils/dateUtils";

const FollowUps = () => {
  const { selectedOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState("today");
  const [followUps, setFollowUps] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [timeRange, setTimeRange] = useState("all_time");
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
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [followUpToUpdate, setFollowUpToUpdate] = useState(null);
  const [followUpToReschedule, setFollowUpToReschedule] = useState(null);
  const [outcomeRemark, setOutcomeRemark] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [currentFollowUp, setCurrentFollowUp] = useState(null);
  const [previewFollowUp, setPreviewFollowUp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "cards" | "table"
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const isTodayDate = (dateVal) => {
    if (!dateVal) return false;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return false;
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    } catch {
      return false;
    }
  };

  const isUpcomingDate = (dateVal) => {
    if (!dateVal) return false;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return false;
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      return d > todayEnd;
    } catch {
      return false;
    }
  };

  const isPastDate = (dateVal) => {
    if (!dateVal) return false;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return false;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return d < todayStart;
    } catch {
      return false;
    }
  };

  const isCompletedToday = (item) => {
    if (!item || item.status !== "Completed") return false;
    return isTodayDate(item.updatedAt) || isTodayDate(item.scheduledAt);
  };

  const canDragFollowUp = (item) => {
    if (!item) return false;
    if (item.status === "Completed") {
      // Historical completed follow-ups cannot be dragged/moved, only today's completed items can be reopened
      return isCompletedToday(item);
    }
    return true;
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredFollowUps.map((f) => f._id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Status-Wise Kanban Columns Definition
  const kanbanColumns = [
    {
      id: "Pending",
      title: "Pending",
      subtitle: "Awaiting action",
      badgeColor: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
      dotColor: "bg-[#D97706]",
      headerBg: "bg-[#FEF3C7]/40",
      accentBorder: "border-t-[3px] border-t-[#D97706]",
    },
    {
      id: "In Progress",
      title: "Attending",
      subtitle: "Actively in discussion",
      badgeColor: "bg-[#FFF1EB] text-[var(--primary)] border-[#FFD8C7]",
      dotColor: "bg-[var(--primary)]",
      headerBg: "bg-[#FFF1EB]/50",
      accentBorder: "border-t-[3px] border-t-[var(--primary)]",
    },
    {
      id: "Rescheduled",
      title: "Rescheduled",
      subtitle: "Deferred / postponed",
      badgeColor: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
      dotColor: "bg-[#2563EB]",
      headerBg: "bg-[#EFF6FF]/40",
      accentBorder: "border-t-[3px] border-t-[#3B82F6]",
    },
    {
      id: "Missed",
      title: "Missed",
      subtitle: "Overdue / unreached",
      badgeColor: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      dotColor: "bg-[#DC2626]",
      headerBg: "bg-[#FEF2F2]/50",
      accentBorder: "border-t-[3px] border-t-[#DC2626]",
    },
    {
      id: "Completed",
      title: "Completed",
      subtitle: "Concluded with outcome",
      badgeColor: "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]",
      dotColor: "bg-[#16A34A]",
      headerBg: "bg-[#F0FDF4]/50",
      accentBorder: "border-t-[3px] border-t-[#10B981]",
    },
  ];

  const getFollowUpColumn = (item) => {
    if (item.status === "In Progress" || item.status === "Attending") return "In Progress";
    if (item.status === "Completed") return "Completed";
    if (item.status === "Missed") return "Missed";
    if (item.status === "Rescheduled") return "Rescheduled";
    return "Pending";
  };

  const handleDragStart = (e, item) => {
    if (!canDragFollowUp(item)) {
      e.preventDefault();
      setToast({
        show: true,
        message: "Historical completed follow-ups are archived records and cannot be moved.",
        type: "warning",
      });
      return;
    }
    setDraggedId(item._id);
    e.dataTransfer.setData("text/plain", item._id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/plain") || draggedId;
    if (!id) return;

    const item = followUps.find((f) => f._id === id);
    if (!item) return;

    if (item.status === "Completed" && !canDragFollowUp(item)) {
      setToast({
        show: true,
        message: "Historical completed follow-ups are archived records and cannot be moved.",
        type: "warning",
      });
      return;
    }

    const currentCol = getFollowUpColumn(item);
    if (currentCol === targetStatus) return;

    // Directly update status
    handleStatusChange(item, targetStatus);
  };

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: 1000,
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
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      setFollowUps([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedOrganization, timeRange]);

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
    if (followUp.status === "Completed" && !canDragFollowUp(followUp)) {
      setToast({
        show: true,
        message: "Historical completed follow-ups are archived records and cannot be modified.",
        type: "warning",
      });
      return;
    }

    if (newStatus === "Completed") {
      setPreviewFollowUp(null);
      setFollowUpToUpdate(followUp);
      setOutcomeRemark("");
      setIsOutcomeOpen(true);
      return;
    }

    if (newStatus === "Rescheduled") {
      setPreviewFollowUp(null);
      setFollowUpToReschedule(followUp);
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      tmrw.setHours(10, 0, 0, 0);
      const localIso = new Date(tmrw.getTime() - tmrw.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setRescheduleDate(localIso);
      setRescheduleNote("");
      setIsRescheduleOpen(true);
      return;
    }

    setActionLoading(true);
    try {
      const updatePayload = { status: newStatus };

      // If moving to "In Progress" (Attending) and it was not scheduled for today (e.g. upcoming or overdue):
      // Automatically reschedule to today's current date/time!
      if (newStatus === "In Progress" && !isTodayDate(followUp.scheduledAt)) {
        const todayNow = new Date();
        const isUpcoming = isUpcomingDate(followUp.scheduledAt);
        const isOverdue = isPastDate(followUp.scheduledAt);
        updatePayload.scheduledAt = todayNow.toISOString();

        const tag = isUpcoming ? "Upcoming" : isOverdue ? "Overdue" : "Rescheduled";
        const existingNotes = followUp.notes || "";
        const logNote = `\n[Moved from ${tag} to Attending Today at ${formatTime(todayNow)}]`;
        updatePayload.notes = (existingNotes + logNote).trim();

        setToast({
          show: true,
          message: `⚡ "${followUp.lead?.name || "Follow-up"}" moved to Attending and rescheduled to Today's Agenda.`,
          type: "success",
        });

        // If currently viewing "upcoming" or "missed", switch activeTab to "today" so the moved item is right in front of the user
        if (activeTab === "upcoming" || activeTab === "missed") {
          setActiveTab("today");
        }
      }

      await followUpService.updateFollowUp(followUp._id, updatePayload);
      await fetchFollowUps();
      await fetchStats();
      if (previewFollowUp?._id === followUp._id) {
        setPreviewFollowUp((prev) => (prev ? { ...prev, ...updatePayload } : null));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleDate) {
      alert("Please select a new date and time for this follow-up.");
      return;
    }

    setActionLoading(true);
    try {
      const selectedDate = new Date(rescheduleDate);
      const existingNotes = followUpToReschedule?.notes || "";
      const reasonText = rescheduleNote.trim()
        ? `\n[Rescheduled to ${formatDateTime(selectedDate)}]: ${rescheduleNote.trim()}`
        : `\n[Rescheduled to ${formatDateTime(selectedDate)}]`;

      await followUpService.updateFollowUp(followUpToReschedule._id, {
        status: "Rescheduled",
        scheduledAt: selectedDate.toISOString(),
        notes: (existingNotes + reasonText).trim(),
      });

      setIsRescheduleOpen(false);
      setFollowUpToReschedule(null);
      setRescheduleNote("");
      await fetchFollowUps();
      await fetchStats();
    } catch (error) {
      console.error("Error rescheduling follow-up:", error);
      alert("Failed to reschedule follow-up. Please try again.");
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
    { id: "today", label: "Today's Agenda", icon: "🕒", count: stats.today || 0 },
    { id: "missed", label: "Overdue", icon: "⚠️", count: stats.missed || 0 },
    { id: "upcoming", label: "Upcoming", icon: "📅", count: stats.upcoming || 0 },
    { id: "completed", label: "Completed", icon: "✅", count: stats.completed || 0 },
    { id: "all", label: "All Records", icon: "📋", count: stats.total || 0 },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
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

      const timeStr = formatTime(date);

      if (diffDays === 0) {
        return `Today at ${timeStr}`;
      } else if (diffDays === 1) {
        return `Tomorrow at ${timeStr}`;
      } else if (diffDays === -1) {
        return `Yesterday at ${timeStr}`;
      }

      return formatDateTime(date);
    } catch {
      return "Invalid date";
    }
  };

  const getShortDate = (dateString) => {
    return formatDateUtil(dateString, "No date");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]";
      case "Pending":
        return "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]";
      case "In Progress":
      case "Attending":
        return "bg-[#FFF1EB] text-[var(--primary)] border border-[#FFD8C7]";
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
    <div className="w-full max-w-[1400px] mx-auto relative px-0 font-inter flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header Block & Spacing Hierarchy */}
      <div className="mb-2 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-[13px] font-semibold text-gray-900 m-0">
              Follow-up Management
            </h1>
            <p className="text-[10px] text-gray-500 m-0 mt-0.5">
              Track and resolve client schedules, communication tasks, and outcome notes.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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
      <div className="shrink-0 mb-1">
        <FollowUpStats stats={stats} />
      </div>

      {/* Quick Filter Tabs */}
      <div className="shrink-0 mb-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-1.5 h-[32px] px-3.5 rounded-full text-[10.5px] font-medium transition-all ${
                  isActive
                    ? "bg-[#111827] text-white shadow-sm"
                    : tab.id === "missed" && tab.count > 0
                      ? "bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] hover:bg-[#FEE2E2]"
                      : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : tab.id === "missed" && tab.count > 0
                        ? "bg-[#FEE2E2] text-[#DC2626]"
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
      <div className="shrink-0 flex items-center justify-between gap-2.5 mb-2.5 flex-wrap">
        {/* Search on left with explicit Search Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearchTerm(searchInput.trim());
          }}
          className="flex items-center gap-1.5 flex-1 max-w-sm sm:max-w-md"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search client, phone, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-[34px] pl-9 pr-7 text-[11px] text-gray-900 bg-white border border-gray-200 rounded-full outline-none focus:border-gray-400 placeholder:text-[#9CA3AF]"
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
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchTerm("");
                }}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-[11px]"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-[34px] px-3.5 rounded-full text-[11px] font-semibold text-white bg-[#111827] hover:bg-black transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <span>Search</span>
          </button>
        </form>

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

          {(searchTerm || searchInput || statusFilter || typeFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
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

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
            {viewMode === "cards" && filteredFollowUps.length > 0 && (
              <div className="hidden md:flex items-center gap-1 mr-1">
                <button
                  type="button"
                  onClick={expandAll}
                  className="h-[30px] px-2.5 rounded-lg text-[10px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Expand all cards"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="h-[30px] px-2.5 rounded-lg text-[10px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Collapse all cards"
                >
                  Collapse all
                </button>
              </div>
            )}

            <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200/80">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`inline-flex items-center gap-1.5 h-[28px] px-2.5 sm:px-3 rounded-lg text-[10.5px] font-medium transition-all ${
                  viewMode === "kanban"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Kanban Board View"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span>Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`inline-flex items-center gap-1.5 h-[28px] px-2.5 sm:px-3 rounded-lg text-[10.5px] font-medium transition-all ${
                  viewMode === "cards"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Expandable Task Cards"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="7" rx="2" />
                  <rect x="3" y="14" width="18" height="7" rx="2" />
                </svg>
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-1.5 h-[28px] px-2.5 sm:px-3 rounded-lg text-[10.5px] font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Table View"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2.5" />
                  <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2.5" />
                  <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2.5" />
                </svg>
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 min-h-0 em-card p-6 space-y-3 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="sk h-12 w-full rounded-[14px]" />
            ))}
          </div>
        ) : filteredFollowUps.length === 0 ? (
          <div className="flex-1 min-h-0 em-card py-10 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#E2E8F0]/60 flex items-center justify-center text-[#94A3B8] mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[13px] font-semibold text-[#111827] m-0 mb-1">
              No follow-ups found
            </h3>
            <p className="text-[10.5px] text-[#64748B] max-w-xs m-0 mb-3">
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
            {/* 1. KANBAN BOARD VIEW (STATUS-WISE) */}
            {viewMode === "kanban" ? (
              <div className="h-full flex gap-3 overflow-x-auto pb-1 items-stretch" style={{ scrollbarWidth: "thin" }}>
                {kanbanColumns.map((col) => {
                  const colItems = filteredFollowUps.filter(
                    (item) => getFollowUpColumn(item) === col.id
                  );
                  const isDragTarget = dragOverCol === col.id;

                  return (
                    <div
                      key={col.id}
                      onDragOver={(e) => handleDragOver(e, col.id)}
                      onDrop={(e) => handleDrop(e, col.id)}
                      className={`w-[260px] sm:w-[280px] lg:flex-1 lg:min-w-[210px] shrink-0 h-full flex flex-col bg-[#F8FAFC]/90 rounded-[20px] border border-gray-200/70 p-3 transition-all ${
                        isDragTarget
                          ? "ring-2 ring-[var(--primary)] bg-orange-50/20 border-transparent shadow-md"
                          : "shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
                      }`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200/60 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                          <div>
                            <h3 className="text-[12px] font-semibold text-gray-900 m-0">
                              {col.title}
                            </h3>
                            <p className="text-[9.5px] text-gray-400 m-0 mt-0.5">
                              {col.subtitle}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${col.badgeColor}`}
                        >
                          {colItems.length}
                        </span>
                      </div>

                      {/* Cards Container with inner scroll */}
                      <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 kanban-col-scroll">
                      {colItems.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[14px] text-center p-3 text-gray-400">
                          <span className="text-[14px] mb-1">📋</span>
                          <span className="text-[10px] font-medium text-gray-400">
                            No items in {col.title.toLowerCase()}
                          </span>
                          <span className="text-[8.5px] text-gray-400 mt-0.5">
                            Drag items here or change status
                          </span>
                        </div>
                      ) : (
                        colItems.map((item) => {
                          const leadName = item.lead?.name || "Unassigned Lead";
                          const isCompleted = item.status === "Completed";
                          const isPastCompleted = isCompleted && !canDragFollowUp(item);
                          const isTodayCompleted = isCompleted && canDragFollowUp(item);
                          const isDraggable = canDragFollowUp(item);
                          const isOverdue =
                            item.status === "Missed" ||
                            (item.status === "Pending" &&
                              item.scheduledAt &&
                              new Date(item.scheduledAt) < new Date());

                          return (
                            <div
                              key={item._id}
                              draggable={isDraggable}
                              onDragStart={(e) => handleDragStart(e, item)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, col.id)}
                              onDrop={(e) => handleDrop(e, col.id)}
                              className={`bg-white rounded-[16px] border border-gray-200/80 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-gray-300 transition-all space-y-2 group ${
                                isDraggable
                                  ? "cursor-grab active:cursor-grabbing"
                                  : "cursor-default opacity-80 bg-gray-50/60"
                              } ${
                                draggedId === item._id ? "opacity-40 scale-95" : ""
                              }`}
                            >
                              {/* Top Row: Type & Due Badge */}
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[11px]"
                                    title={item.type || "Call"}
                                  >
                                    {getTypeIcon(item.type)}
                                  </span>
                                  <span className="text-[10px] font-medium text-gray-500">
                                    {item.type || "Call"}
                                  </span>
                                </div>
                                {isPastCompleted ? (
                                  <span
                                    className="text-[8.5px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 inline-flex items-center gap-1"
                                    title="Archived completed record - cannot be moved"
                                  >
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Archived</span>
                                  </span>
                                ) : isTodayCompleted ? (
                                  <span
                                    className="text-[8.5px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] inline-flex items-center gap-0.5"
                                    title="Completed today - can be reopened"
                                  >
                                    <span>✓ Done Today</span>
                                  </span>
                                ) : (
                                  <span
                                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                      isOverdue && !isCompleted
                                        ? "bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]"
                                        : "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                                    }`}
                                  >
                                    {formatDate(item.scheduledAt)}
                                  </span>
                                )}
                              </div>

                              {/* Main Content: Lead Name & Notes */}
                              <div
                                onClick={() => setPreviewFollowUp(item)}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <h4
                                    className={`text-[11.5px] font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors m-0 truncate ${
                                      isCompleted ? "line-through text-gray-400" : ""
                                    }`}
                                  >
                                    {leadName}
                                  </h4>
                                  {isTodayCompleted && (
                                    <span className="text-[8.5px] text-emerald-600 font-medium shrink-0">
                                      (Today)
                                    </span>
                                  )}
                                </div>
                                {item.lead?.company && (
                                  <p className="text-[10px] text-gray-400 m-0 mt-0.5 truncate font-medium">
                                    {item.lead.company}
                                  </p>
                                )}
                              </div>

                              {/* Notes Snippet */}
                              {item.notes && (
                                <p className="text-[10px] text-gray-600 bg-gray-50/90 p-2 rounded-[10px] border border-gray-100/80 m-0 line-clamp-2 leading-relaxed">
                                  {item.notes}
                                </p>
                              )}

                              {/* Outcome if completed */}
                              {item.outcome && (
                                <p className="text-[10px] text-emerald-700 bg-emerald-50/60 p-2 rounded-[10px] border border-emerald-100/80 m-0 line-clamp-2 leading-relaxed font-medium">
                                  ✓ {item.outcome}
                                </p>
                              )}

                              {/* Bottom Action Strip */}
                              <div
                                className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-[10px]"
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onDragStart={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center gap-1">
                                  {item.lead?.phone && (
                                    <a
                                      href={`tel:${item.lead.phone}`}
                                      className="w-6 h-6 rounded-md hover:bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors"
                                      title={`Call ${item.lead.phone}`}
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                    </a>
                                  )}
                                  {item.lead?.email && (
                                    <a
                                      href={`mailto:${item.lead.email}`}
                                      className="w-6 h-6 rounded-md hover:bg-blue-50 text-blue-600 flex items-center justify-center transition-colors"
                                      title={`Email ${item.lead.email}`}
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    </a>
                                  )}
                                  {!isPastCompleted && (
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(item)}
                                      className="w-6 h-6 rounded-md hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
                                      title="Edit"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </button>
                                  )}
                                </div>

                                {/* Right: Quick Status Mover */}
                                <div className="flex items-center gap-1">
                                  {isPastCompleted ? (
                                    <span className="text-[9px] text-gray-400 font-medium flex items-center gap-1 px-1.5 py-0.5 bg-gray-100/80 rounded" title="Historical completed record - locked">
                                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                      <span>Settled</span>
                                    </span>
                                  ) : (
                                    <>
                                      <select
                                        value={getFollowUpColumn(item)}
                                        onChange={(e) => handleStatusChange(item, e.target.value)}
                                        className="h-[22px] px-1 text-[9.5px] font-semibold bg-gray-50 border border-gray-200 rounded-md outline-none cursor-pointer hover:border-gray-400 text-gray-700"
                                        title="Move to status"
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">Attending</option>
                                        <option value="Rescheduled">Rescheduled</option>
                                        <option value="Missed">Missed</option>
                                        <option value="Completed">Completed</option>
                                      </select>

                                      {col.id !== "Completed" && (
                                        <button
                                          type="button"
                                          onClick={() => handleStatusChange(item, "Completed")}
                                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200"
                                          title="Mark Done"
                                        >
                                          ✓
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === "cards" ? (
            <div className="h-full overflow-y-auto pr-1 space-y-2.5 kanban-col-scroll pb-2">
              {filteredFollowUps.map((item) => {
                const isExpanded = expandedIds.has(item._id);
                const leadName = item.lead?.name || "Unassigned Lead";
                const isCompleted = item.status === "Completed";
                const isOverdue =
                  item.status === "Missed" ||
                  (item.status === "Pending" && item.scheduledAt && new Date(item.scheduledAt) < new Date());

                const isPastCompleted = isCompleted && !canDragFollowUp(item);
                const isTodayCompleted = isCompleted && canDragFollowUp(item);

                const borderClass = isCompleted
                  ? "border-l-4 border-l-emerald-500"
                  : isOverdue
                    ? "border-l-4 border-l-rose-500"
                    : "border-l-4 border-l-[var(--primary)]";

                return (
                  <div
                    key={item._id}
                    className={`bg-white rounded-[18px] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all overflow-hidden ${borderClass}`}
                  >
                    {/* Collapsed / Header Strip (Click anywhere to expand) */}
                    <div
                      onClick={() => toggleExpand(item._id)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#FAFAFA]/70 transition-colors flex-wrap sm:flex-nowrap"
                    >
                      {/* Left Block: Checkbox, Channel, Lead */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Quick Completion Checkbox */}
                        <button
                          type="button"
                          disabled={isPastCompleted}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPastCompleted) {
                              setToast({
                                show: true,
                                message: "Historical completed follow-ups are archived records and cannot be modified.",
                                type: "warning",
                              });
                              return;
                            }
                            handleStatusChange(item, isCompleted ? "Pending" : "Completed");
                          }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                            isCompleted
                              ? isPastCompleted
                                ? "bg-gray-300 text-white cursor-not-allowed"
                                : "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                              : "border-2 border-gray-300 hover:border-emerald-500 text-transparent hover:text-emerald-500"
                          }`}
                          title={
                            isPastCompleted
                              ? "Historical completed record (Locked)"
                              : isCompleted
                                ? "Reopen follow-up (Completed today)"
                                : "Mark Completed"
                          }
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>

                        {/* Channel Type Badge */}
                        <div
                          className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[13px] shrink-0"
                          title={item.type || "Call"}
                        >
                          {getTypeIcon(item.type)}
                        </div>

                        {/* Lead / Client Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[12px] font-semibold text-gray-900 ${
                                isCompleted ? "line-through text-gray-400" : ""
                              }`}
                            >
                              {leadName}
                            </span>
                            {item.lead?.company && (
                              <span className="text-[10px] text-gray-400 font-medium truncate max-w-[140px]">
                                • {item.lead.company}
                              </span>
                            )}
                            {isPastCompleted ? (
                              <span
                                className="inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gray-100 text-gray-500 border border-gray-200"
                                title="Historical record (Archived)"
                              >
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Completed (Archived)</span>
                              </span>
                            ) : isTodayCompleted ? (
                              <span
                                className="inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]"
                                title="Completed today (Can be reopened)"
                              >
                                <span>✓ Done Today</span>
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-semibold ${getStatusBadge(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-0.5 truncate">
                            <span
                              className={`flex items-center gap-1 font-semibold ${
                                isOverdue && !isCompleted
                                  ? "text-rose-600"
                                  : "text-gray-700"
                              }`}
                            >
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {formatDate(item.scheduledAt)}
                            </span>
                            {item.notes && (
                              <span className="text-gray-400 truncate max-w-sm hidden md:inline">
                                — {item.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Direct contact + Actions + Expand chevron */}
                      <div
                        className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.lead?.phone && (
                          <a
                            href={`tel:${item.lead.phone}`}
                            className="em-icon-btn text-emerald-600 hover:bg-emerald-50"
                            title={`Call ${item.lead.phone}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </a>
                        )}

                        {item.lead?.email && (
                          <a
                            href={`mailto:${item.lead.email}`}
                            className="em-icon-btn text-blue-600 hover:bg-blue-50"
                            title={`Email ${item.lead.email}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="em-icon-btn em-icon-edit"
                          title="Edit Follow-up"
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
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        {/* Expand / Collapse Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(item._id);
                          }}
                          className={`inline-flex items-center gap-1 h-[28px] px-2.5 rounded-lg text-[10px] font-medium border border-gray-200 transition-colors ${
                            isExpanded
                              ? "bg-gray-100 text-gray-900 border-gray-300"
                              : "bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span>{isExpanded ? "Hide" : "Details"}</span>
                          <svg
                            className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED DETAILS DRAWER */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-[#FBFBFC]/90 p-4 text-[11px] space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Agenda & Notes Box */}
                          <div className="bg-white p-3 rounded-[14px] border border-gray-200/70 shadow-sm">
                            <span className="text-[9.5px] uppercase tracking-wider font-semibold text-gray-400 block mb-1">
                              Discussion Agenda & Notes
                            </span>
                            <p className="text-gray-800 leading-relaxed m-0 whitespace-pre-wrap text-[11px]">
                              {item.notes || "No discussion notes recorded."}
                            </p>
                          </div>

                          {/* Outcome / Result Box */}
                          <div className="bg-white p-3 rounded-[14px] border border-gray-200/70 shadow-sm">
                            <span className="text-[9.5px] uppercase tracking-wider font-semibold text-gray-400 block mb-1">
                              Concluded Outcome
                            </span>
                            {item.outcome ? (
                              <p className="text-emerald-700 leading-relaxed m-0 whitespace-pre-wrap text-[11px] font-medium">
                                {item.outcome}
                              </p>
                            ) : (
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-gray-400">
                                <span>No outcome recorded yet.</span>
                                {item.status !== "Completed" && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(item, "Completed")}
                                    className="text-[10px] text-[var(--primary)] font-semibold hover:underline"
                                  >
                                    Mark Done & Record Outcome →
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Metadata & Shortcuts */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200/60 text-[10px] text-gray-500 flex-wrap">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span>
                              <strong>Organization:</strong>{" "}
                              {item.organization?.name || item.lead?.organizationName || "-"}
                            </span>
                            {item.lead?.phone && (
                              <span>
                                <strong>Phone:</strong> {item.lead.phone}
                              </span>
                            )}
                            {item.lead?.email && (
                              <span>
                                <strong>Email:</strong> {item.lead.email}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewFollowUp(item)}
                              className="text-[10px] text-gray-600 hover:text-gray-900 font-medium hover:underline"
                            >
                              Inspect Full Profile →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* 3. TABLE VIEW */
            <div className="h-full flex flex-col border border-gray-200/80 rounded-[18px] bg-white shadow-sm overflow-hidden">
              <div className="flex-1 min-h-0 overflow-auto kanban-col-scroll">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5] border-b border-gray-200 bg-[#F8FAFC] whitespace-nowrap select-none">
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
                            {formatDateTime(item.scheduledAt)}
                          </td>

                          <td className="px-4 py-2 whitespace-nowrap">
                            {item.status === "Completed" && !canDragFollowUp(item) ? (
                              <span
                                className="inline-flex items-center gap-1 justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-gray-100 text-gray-500 border border-gray-200"
                                title="Historical completed record (Archived)"
                              >
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Completed (Archived)</span>
                              </span>
                            ) : item.status === "Completed" && canDragFollowUp(item) ? (
                              <span
                                className="inline-flex items-center gap-1 justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]"
                                title="Completed today (Can be reopened)"
                              >
                                <span>✓ Done Today</span>
                              </span>
                            ) : (
                              <span className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold ${getStatusBadge(item.status)}`}>
                                {item.status}
                              </span>
                            )}
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

                              {item.status === "Completed" && canDragFollowUp(item) && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(item, "In Progress")}
                                  className="em-icon-btn text-[var(--primary)] hover:bg-orange-50"
                                  title="Reopen (Move to Attending)"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </button>
                              )}

                              {!(item.status === "Completed" && !canDragFollowUp(item)) && (
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
                              )}

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

              {/* Mobile Table Fallback */}
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

      {/* Modal Dialog: Reschedule Follow-up */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm font-inter">
          <div className="flex flex-col w-full max-w-[500px] max-h-[85vh] max-h-[85dvh] bg-white border border-gray-100 rounded-[24px] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-[14px] font-semibold text-gray-900 m-0">
                  Reschedule Follow-up
                </h2>
                <p className="text-[10px] text-gray-500 m-0 mt-0.5">
                  Pick a new date & time so this task appears in that day's agenda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRescheduleSubmit} className="flex-1 flex flex-col justify-between">
              <div className="p-6 space-y-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {/* Lead context */}
                <div className="p-3 bg-[#F8FAFC] rounded-[14px] border border-[#E2E8F0]">
                  <span className="text-[9.5px] uppercase tracking-[0.08em] font-semibold text-[#8B92A5] block mb-0.5">
                    Lead Interaction
                  </span>
                  <p className="text-[11.5px] font-semibold text-[#111827] m-0">
                    {followUpToReschedule?.lead?.name || "Client"}
                  </p>
                  <p className="text-[10px] text-[#64748B] m-0 mt-0.5">
                    {followUpToReschedule?.type} • Currently scheduled for {formatDateTime(followUpToReschedule?.scheduledAt)}
                  </p>
                </div>

                {/* Preset Date Shortcuts */}
                <div>
                  <label className="text-[10px] font-medium text-[#4A5565] mb-1.5 block">
                    Quick Preset Dates
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        d.setHours(10, 0, 0, 0);
                        setRescheduleDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
                      }}
                      className="px-2.5 py-1 text-[10px] font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      Tomorrow 10:00 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 2);
                        d.setHours(11, 0, 0, 0);
                        setRescheduleDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
                      }}
                      className="px-2.5 py-1 text-[10px] font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      In 2 Days 11:00 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 7);
                        d.setHours(10, 0, 0, 0);
                        setRescheduleDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
                      }}
                      className="px-2.5 py-1 text-[10px] font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      Next Week (+7d)
                    </button>
                  </div>
                </div>

                {/* New Date & Time Picker */}
                <div>
                  <label className="text-[10px] font-medium text-[#4A5565] mb-1 block">
                    New Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full h-[36px] px-3 text-[11px] font-medium text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none focus:border-[var(--primary)]"
                  />
                  <p className="text-[9px] text-gray-400 mt-1">
                    When this selected day arrives, this task will show up in "Today's Agenda".
                  </p>
                </div>

                {/* Reason Note */}
                <div>
                  <label className="text-[10px] font-medium text-[#4A5565] mb-1 block">
                    Reschedule Reason / Next Steps Note
                  </label>
                  <textarea
                    value={rescheduleNote}
                    onChange={(e) => setRescheduleNote(e.target.value)}
                    placeholder="e.g. Client requested callback on this date, traveling currently..."
                    className="w-full p-2.5 text-[11px] text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none min-h-[75px] resize-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
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
                  {actionLoading ? "Saving..." : "Save & Reschedule"}
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
                      {formatDateTime(previewFollowUp.scheduledAt)}
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
      {/* Floating Notification Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[1300] max-w-sm sm:max-w-md bg-[#111827] text-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-700/60 flex items-center gap-3 text-[11px] font-medium transition-all transform">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[12px]">
            {toast.type === "success" ? "⚡" : toast.type === "warning" ? "🔒" : "ℹ️"}
          </div>
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast({ show: false, message: "", type: "info" })}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors ml-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowUps;

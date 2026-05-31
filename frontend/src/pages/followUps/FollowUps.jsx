import BasicModal from "../../components/common/modals/BasicModal";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import followUpService from "../../services/followUpService";
import FollowUpList from "./FollowUpList";
import FollowUpForm from "./FollowUpForm";
import FollowUpStats from "./FollowUpStats";
import SectionHeader from "../../components/common/sections/SectionHeader";
import TimeRangeFilter, { getDateRange } from "../../components/common/TimeRangeFilter";
import StatsWrapper from "../../components/common/sections/StatsWrapper";

const FollowUps = () => {
  const { selectedOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState("today");
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [followUpToUpdate, setFollowUpToUpdate] = useState(null);
  const [outcomeRemark, setOutcomeRemark] = useState("");
  const [currentFollowUp, setCurrentFollowUp] = useState(null);
  // const [loading, setLoading] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    // setLoading(true);
    try {
      // Build params with pagination
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Add tab-based filters
      if (activeTab === "today") params.range = "today";
      else if (activeTab === "upcoming") params.range = "upcoming";
      else if (activeTab === "missed") params.range = "overdue";
      else if (activeTab === "completed") params.status = "Completed";

      // Global Time Range Filter
      const range = getDateRange(timeRange);
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

      const response = await followUpService.getFollowUps(params);
      setFollowUps(response.data);

      // Update pagination metadata if available
      if (response.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total || 0,
          pages: response.pagination.pages || 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
    }
  }, [activeTab, pagination.page, pagination.limit, selectedOrganization, timeRange]);

  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      const range = getDateRange(timeRange);
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

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

  // Refresh stats when active tab changes so labels reflect current view
  useEffect(() => {
    fetchStats();
  }, [activeTab, fetchStats]);

  const handleRangeChange = (range) => {
    // Already handled by effects
  };

  const handleCreate = () => {
    setCurrentFollowUp(null);
    setIsModalOpen(true);
  };

  const handleEdit = (followUp) => {
    setCurrentFollowUp(followUp);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this follow-up?")) {
      try {
        await followUpService.deleteFollowUp(id);
        fetchFollowUps();
        fetchStats();
      } catch (error) {
        console.error("Error deleting follow-up:", error);
      }
    }
  };

  const handleStatusChange = async (followUp, newStatus) => {
    if (newStatus === "Completed") {
      setFollowUpToUpdate(followUp);
      setOutcomeRemark("");
      setIsOutcomeModalOpen(true);
      return;
    }

    try {
      await followUpService.updateFollowUp(followUp._id, { status: newStatus });
      fetchFollowUps();
      fetchStats();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleOutcomeSubmit = async (e) => {
    e.preventDefault();
    if (!outcomeRemark.trim()) return;

    try {
      await followUpService.updateFollowUp(followUpToUpdate._id, {
        status: "Completed",
        outcome: outcomeRemark,
      });
      setIsOutcomeModalOpen(false);
      setFollowUpToUpdate(null);
      setOutcomeRemark("");
      fetchFollowUps();
      fetchStats();
    } catch (error) {
      console.error("Error updating status with outcome:", error);
    }
  };

  const handleFormSubmit = async (data) => {
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
      setIsModalOpen(false);
      fetchFollowUps(); // This will refresh both list and stats
      fetchStats();
    } catch (error) {
      console.error("Error saving follow-up:", error);
      alert("Failed to save follow-up. Please check if Lead field is valid.");
    }
  };

  const tabs = [
    { id: "today", label: `Today's Actions (${stats.today || 0})` },
    { id: "all", label: `All Records (${stats.total || 0})` },
    { id: "upcoming", label: `Upcoming (${stats.upcoming || 0})` },
    { id: "missed", label: `Missed/Overdue (${stats.missed || 0})` },
    { id: "completed", label: `Completed (${stats.completed || 0})` },
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
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on tab change
  };

  // Filter follow-ups based on search and filters
  const filteredFollowUps = followUps.filter((followUp) => {
    const matchesSearch =
      !searchTerm ||
      followUp.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followUp.lead?.phone?.includes(searchTerm);

    const matchesStatus = !statusFilter || followUp.status === statusFilter;
    const matchesType = !typeFilter || followUp.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-4 md:mb-6 gap-2 md:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-base md:text-base font-light text-black truncate">
            Follow-up management
          </h1>
          <p className="text-black text-base hidden md:block">
            Track and manage your customer interactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimeRangeFilter
            value={timeRange}
            onChange={setTimeRange}
          />
          <button
            onClick={handleCreate}
            className="bg-black text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-800 transition-colors text-base md:text-base font-light whitespace-nowrap flex-shrink-0"
          >
            <span className="hidden sm:inline">+ Schedule new</span>
            <span className="sm:hidden">+ New</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 md:mb-6 -mx-4 md:mx-0 px-4 md:px-0">
        <div className="flex items-center gap-2 bg-white/85 border border-slate-200 p-2 rounded-2xl w-full md:w-fit overflow-x-auto scrollbar-hide shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2.5 md:px-5 md:py-2.5 rounded-full text-sm md:text-base font-semibold transition-all whitespace-nowrap flex-shrink-0 min-w-fit ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                  : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <StatsWrapper title="Follow-Ups Overview">
        <FollowUpStats stats={stats} />
      </StatsWrapper>

      {/* Search and Filters */}
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by lead name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 text-base"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="md:hidden px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black hover:bg-gray-100 transition-colors text-base font-light inline-flex items-center justify-between"
        >
          <span>Filters</span>
          <svg
            className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${filtersOpen ? "block" : "hidden"} md:block px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white`}
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
          className={`${filtersOpen ? "block" : "hidden"} md:block px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white`}
        >
          <option value="">All Types</option>
          <option value="Call">Call</option>
          <option value="Email">Email</option>
          <option value="Meeting">Meeting</option>
          <option value="Task">Task</option>
        </select>
      </div>

      <div className="pb-6">
        <FollowUpList
          followUps={filteredFollowUps}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}

          // loading={loading}
        />
      </div>

      {/* Modal */}
      <BasicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentFollowUp ? "Edit follow-up" : "Schedule follow-up"}
      >
        <FollowUpForm
          initialData={currentFollowUp}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </BasicModal>

      {/* Outcome Prompt Modal */}
      <BasicModal
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        title="Follow-up outcome"
      >
        <form onSubmit={handleOutcomeSubmit} className="space-y-4">
          <p className="text-base text-black">
            Please provide a remark/outcome for this follow-up with{" "}
            <span className="font-light">
              {followUpToUpdate?.lead?.name}
            </span>
            .
          </p>
          <div className="space-y-1">
            <label className="text-base font-light text-black">
              Outcome / Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
              placeholder="What was the result of this interaction?"
              value={outcomeRemark}
              onChange={(e) => setOutcomeRemark(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsOutcomeModalOpen(false)}
              className="px-4 py-2 bg-white border border-gray-300 text-black font-light rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white font-light rounded-lg hover:bg-gray-800"
            >
              Complete Follow-up
            </button>
          </div>
        </form>
      </BasicModal>
    </div>
  );
};

export default FollowUps;

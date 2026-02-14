import BasicModal from "../../components/common/modals/BasicModal";
import React, { useState, useEffect, useCallback } from "react";
import followUpService from "../../services/followUpService";
import FollowUpList from "./FollowUpList";
import FollowUpForm from "./FollowUpForm";
import FollowUpStats from "./FollowUpStats";
import SectionHeader from "../../components/common/sections/SectionHeader";

const FollowUps = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [followUps, setFollowUps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    missed: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [followUpToUpdate, setFollowUpToUpdate] = useState(null);
  const [outcomeRemark, setOutcomeRemark] = useState("");
  const [currentFollowUp, setCurrentFollowUp] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
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

      // Calculate stats from all follow-ups
      const allResponse = await followUpService.getFollowUps({});
      const allFollowUps = allResponse.data;
      setStats({
        total: allFollowUps.length,
        pending: allFollowUps.filter((f) => f.status === "Pending").length,
        completed: allFollowUps.filter((f) => f.status === "Completed").length,
        missed: allFollowUps.filter((f) => f.status === "Missed").length,
      });
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

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
    } catch (error) {
      console.error("Error updating status with outcome:", error);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (currentFollowUp) {
        await followUpService.updateFollowUp(currentFollowUp._id, data);
      } else {
        await followUpService.createFollowUp(data);
      }
      setIsModalOpen(false);
      fetchFollowUps(); // This will refresh both list and stats
    } catch (error) {
      console.error("Error saving follow-up:", error);
      alert("Failed to save follow-up. Please check if Lead field is valid.");
    }
  };

  const tabs = [
    { id: "today", label: "Today's Actions" },
    { id: "all", label: `All Records (${stats.total})` },
    { id: "upcoming", label: "Upcoming" },
    { id: "missed", label: `Missed/Overdue (${stats.missed})` },
    { id: "completed", label: `Completed (${stats.completed})` },
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
            Follow-up management
          </h1>
          <p className="text-gray-500 text-sm hidden md:block">
            Track and manage your customer interactions
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-black text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-800 transition-colors text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0"
        >
          <span className="hidden sm:inline">+ Schedule new</span>
          <span className="sm:hidden">+ New</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 md:mb-6 -mx-4 md:mx-0 px-4 md:px-0">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full md:w-fit overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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

      {/* Stats */}
      <FollowUpStats stats={stats} />

      {/* Search and Filters */}
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by lead name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
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
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
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
          loading={loading}
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
          <p className="text-sm text-gray-600">
            Please provide a remark/outcome for this follow-up with{" "}
            <span className="font-semibold">
              {followUpToUpdate?.lead?.name}
            </span>
            .
          </p>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
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
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800"
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

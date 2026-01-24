import BasicModal from "../components/common/modals/BasicModal";
import React, { useState, useEffect, useCallback } from "react";
import followUpService from "../services/followUpService";
import FollowUpList from "../components/followUps/FollowUpList";
import FollowUpForm from "../components/followUps/FollowUpForm";
import FollowUpStats from "../components/followUps/FollowUpStats";
import SectionHeader from "../components/common/SectionHeader";

const FollowUps = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [followUps, setFollowUps] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    missed: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      // First fetch the list for the active tab
      const params = {};
      if (activeTab === "today") params.range = "today";
      else if (activeTab === "upcoming") params.range = "upcoming";
      else if (activeTab === "missed") params.range = "overdue";
      else if (activeTab === "completed") params.status = "Completed";

      const response = await followUpService.getFollowUps(params);
      setFollowUps(response.data);

      // Should ideally fetch stats from a dedicated endpoint.
      // for now, we leave stats static or calculate simplified version
      // In a real app, I'd add /api/follow-ups/stats
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

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
    try {
      await followUpService.updateFollowUp(followUp._id, { status: newStatus });
      fetchFollowUps();
    } catch (error) {
      console.error("Error updating status:", error);
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
      fetchFollowUps();
    } catch (error) {
      console.error("Error saving follow-up:", error);
      alert("Failed to save follow-up. Please check if Lead field is valid.");
    }
  };

  const tabs = [
    { id: "today", label: "Today's Actions" },
    { id: "upcoming", label: "Upcoming" },
    { id: "missed", label: "Missed/Overdue" },
    { id: "completed", label: "Completed" },
    { id: "all", label: "All Records" },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-4 md:mb-6 gap-2 md:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
            Follow-up Management
          </h1>
          <p className="text-gray-500 text-sm hidden md:block">
            Track and manage your customer interactions
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-black text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-800 transition-colors text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0"
        >
          <span className="hidden sm:inline">+ Schedule New</span>
          <span className="sm:hidden">+ New</span>
        </button>
      </div>

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

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="pb-20">
          <FollowUpList
            followUps={followUps}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}

      {/* Modal */}
      <BasicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentFollowUp ? "Edit Follow-up" : "Schedule Follow-up"}
      >
        <FollowUpForm
          initialData={currentFollowUp}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </BasicModal>
    </div>
  );
};

export default FollowUps;

import React, { useState, useEffect, useCallback } from "react";
import referrerService from "../services/referrerService";
import ReferrerStats from "../components/referrers/ReferrerStats";
import ReferrersTable from "../components/referrers/ReferrersTable";
import ReferrerForm from "../components/referrers/ReferrerForm";
import Toast from "../components/common/utils/Toast";

// Preview Modal Component
const PreviewModal = ({ referrer, stats, onClose }) => {
  if (!referrer) return null;

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
          <div>
            <h2 className="text-xl font-bold text-gray-900">{referrer.name}</h2>
            <p className="text-sm text-gray-500">
              {referrer.companyName || "No Company"}{" "}
              {referrer.designation && `• ${referrer.designation}`}
            </p>
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
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Contact Details
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="font-semibold w-32 inline-block text-gray-500">
                    Phone:
                  </span>{" "}
                  {referrer.phone}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-32 inline-block text-gray-500">
                    Email:
                  </span>{" "}
                  {referrer.email || "-"}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-32 inline-block text-gray-500">
                    Alt Phone:
                  </span>{" "}
                  {referrer.alternatePhone || "-"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Status
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="font-semibold w-32 inline-block text-gray-500">
                    Active:
                  </span>{" "}
                  {referrer.isActive ? "Yes" : "No"}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-32 inline-block text-gray-500">
                    Joined:
                  </span>{" "}
                  {formatDate(referrer.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Referral Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-900 rounded-xl text-white">
                <div>
                  <div className="text-xs text-gray-400 uppercase">
                    Total Leads
                  </div>
                  <div className="text-lg font-bold">
                    {stats.totalLeads || 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase">Active</div>
                  <div className="text-lg font-bold">
                    {stats.activeLeads || 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase">
                    Converted
                  </div>
                  <div className="text-lg font-bold">
                    {stats.convertedLeads || 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase">Lost</div>
                  <div className="text-lg font-bold">
                    {stats.lostLeads || 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase">
                    Conversion %
                  </div>
                  <div className="text-lg font-bold">
                    {stats.conversionPercentage || 0}%
                  </div>
                </div>
              </div>
              {stats.lastLeadDate && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Last Lead Date:</span>{" "}
                  {formatDate(stats.lastLeadDate)}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {referrer.notes && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Notes
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed border border-gray-100">
                {referrer.notes}
              </p>
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

const Referrers = () => {
  const [referrers, setReferrers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [stats, setStats] = useState({
    totalReferrers: 0,
    activeReferrers: 0,
    totalLeadsReferred: 0,
    convertedLeads: 0,
    avgConversionRate: 0,
    recentReferrals: 0,
  });
  const [referrerStats, setReferrerStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list"); // 'list', 'create', 'edit'
  const [currentReferrer, setCurrentReferrer] = useState(null);
  const [previewReferrer, setPreviewReferrer] = useState(null);
  const [previewStats, setPreviewStats] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filters, setFilters] = useState({
    search: "",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchReferrers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.search) params.search = filters.search;

      const response = await referrerService.getReferrers(params);
      setReferrers(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 1,
      }));

      // Fetch stats for each referrer
      const statsPromises = response.data.map((referrer) =>
        referrerService.getReferrerStatsById(referrer._id),
      );
      const statsResponses = await Promise.all(statsPromises);
      const statsMap = {};
      statsResponses.forEach((res) => {
        if (res.data && res.data.referrer) {
          statsMap[res.data.referrer._id] = res.data.stats;
        }
      });
      setReferrerStats(statsMap);
    } catch (error) {
      console.error("Error fetching referrers:", error);
      showSnackbar("Failed to fetch referrers", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const fetchStats = async () => {
    try {
      const response = await referrerService.getReferrerStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReferrers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchReferrers]);

  const handleCreate = () => {
    setCurrentReferrer(null);
    setView("create");
  };

  const handleEdit = (referrer) => {
    setCurrentReferrer(referrer);
    setView("edit");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this referrer?")) {
      try {
        await referrerService.deleteReferrer(id);
        showSnackbar("Referrer deleted successfully", "success");
        fetchReferrers();
        fetchStats();
      } catch (error) {
        console.error("Error deleting referrer:", error);
        showSnackbar("Failed to delete referrer", "error");
      }
    }
  };

  const handleView = async (referrer) => {
    setPreviewReferrer(referrer);
    // Fetch detailed stats for this referrer
    try {
      const response = await referrerService.getReferrerStatsById(referrer._id);
      setPreviewStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching referrer stats:", error);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (currentReferrer) {
        await referrerService.updateReferrer(currentReferrer._id, data);
        showSnackbar("Referrer updated successfully", "success");
      } else {
        await referrerService.createReferrer(data);
        showSnackbar("Referrer created successfully", "success");
      }
      setView("list");
      setCurrentReferrer(null);
      fetchReferrers();
      fetchStats();
    } catch (error) {
      console.error("Error saving referrer:", error);
      const errMsg = error.response?.data?.message || "Failed to save referrer";
      showSnackbar(errMsg, "error");
    }
  };

  const handleCancelForm = () => {
    setView("list");
    setCurrentReferrer(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
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

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {view === "list"
            ? "Referrers"
            : view === "create"
              ? "Create New Referrer"
              : "Edit Referrer"}
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

      {loading && view === "list" ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {view === "list" && (
            <>
              {/* Stats */}
              <ReferrerStats stats={stats} />

              {/* Referrers Table */}
              <div className="pb-20">
                <ReferrersTable
                  referrers={referrers}
                  onCreate={handleCreate}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  referrerStats={referrerStats}
                />
              </div>
            </>
          )}

          {(view === "create" || view === "edit") && (
            <div className="max-w-7xl mx-auto">
              <ReferrerForm
                key={currentReferrer ? currentReferrer._id : "new"}
                initialData={currentReferrer}
                onSubmit={
                  view === "create" ? handleFormSubmit : handleFormSubmit
                }
                onCancel={handleCancelForm}
              />
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      <PreviewModal
        referrer={previewReferrer}
        stats={previewStats}
        onClose={() => {
          setPreviewReferrer(null);
          setPreviewStats(null);
        }}
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

export default Referrers;

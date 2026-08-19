import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import referrerService from "../../services/referrerService";
import ReferrerStats from "./ReferrerStats";
import ReferrersTable from "./ReferrersTable";
import ReferrerForm from "./ReferrerForm";
import Toast from "../../components/common/utils/Toast";
import StatsWrapper from "../../components/common/sections/StatsWrapper";

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
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{referrer.name}</h2>
            <p className="text-sm font-medium text-gray-500 mt-0.5">
              {referrer.organizationName || "No Organization"}{" "}
              {referrer.designation && `• ${referrer.designation}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 bg-gray-50/30">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">👤</div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contact Details
                </h3>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-gray-400 block text-xs mb-1 uppercase tracking-wide">Phone</span>
                  <p className="font-medium text-gray-900">{referrer.phone || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs mb-1 uppercase tracking-wide">Email</span>
                  <p className="font-medium text-gray-900">{referrer.email || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs mb-1 uppercase tracking-wide">Alt Phone</span>
                  <p className="font-medium text-gray-900">{referrer.alternatePhone || "-"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-green-50 text-green-600 rounded-lg text-sm">✅</div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </h3>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-gray-400 block text-xs mb-1 uppercase tracking-wide">Active</span>
                  <p className="font-medium text-gray-900">{referrer.isActive ? "Yes" : "No"}</p>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs mb-1 uppercase tracking-wide">Joined</span>
                  <p className="font-medium text-gray-900">{formatDate(referrer.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="bg-slate-900 rounded-xl p-5 text-white shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-slate-800 text-white rounded-lg text-sm">📊</div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Referral Statistics
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <span className="text-slate-400 block text-xs mb-1 uppercase tracking-wide">Total Leads</span>
                  <p className="font-semibold text-sm">{stats.totalLeads || 0}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs mb-1 uppercase tracking-wide">Active</span>
                  <p className="font-semibold text-sm">{stats.activeLeads || 0}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs mb-1 uppercase tracking-wide">Converted</span>
                  <p className="font-semibold text-sm">{stats.convertedLeads || 0}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs mb-1 uppercase tracking-wide">Lost</span>
                  <p className="font-semibold text-sm">{stats.lostLeads || 0}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs mb-1 uppercase tracking-wide">Conversion %</span>
                  <p className="font-semibold text-sm">{stats.conversionPercentage || 0}%</p>
                </div>
              </div>
              {stats.lastLeadDate && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className="text-slate-400 block text-xs mb-1 uppercase tracking-wide">Last Lead Date</span>
                  <p className="font-semibold text-sm">{formatDate(stats.lastLeadDate)}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {referrer.notes && (
            <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm">📝</div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Notes
                </h3>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed font-medium">
                {referrer.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const Referrers = () => {
  const { selectedOrganization } = useAuth();
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
  // const [loading, setLoading] = useState(false);
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
    // setLoading(true);
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
      const statsPromises = response.data
        .map((referrer) =>
          referrer ? referrerService.getReferrerStatsById(referrer._id) : null,
        )
        .filter((p) => p !== null);

      const statsResponses = await Promise.all(statsPromises);
      const statsMap = {};
      statsResponses.forEach((res) => {
        if (res && res.data && res.data.referrer && res.data.referrer._id) {
          statsMap[res.data.referrer._id] = res.data.stats;
        }
      });
      setReferrerStats(statsMap);
    } catch (error) {
      console.error("Error fetching referrers:", error);
      showSnackbar("Failed to fetch referrers", "error");
    } finally {
      // setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, selectedOrganization]);

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
  }, [selectedOrganization]);

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
        const payload = { ...data };
        if (selectedOrganization) {
          payload.organization = selectedOrganization;
        }
        await referrerService.createReferrer(payload);
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
        <h1 className="text-sm font-medium text-slate-800">
          {view === "list"
            ? "Referrers"
            : view === "create"
              ? "Create new referrer"
              : "Edit referrer"}
        </h1>
        {view !== "list" && (
          <button
            onClick={handleCancelForm}
            className="p-2 border border-gray-300 rounded-lg text-black hover:bg-slate-50 transition-colors"
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

      {view === "list" ? (
        <>
          {/* Stats */}
          <StatsWrapper title="Referrers Overview">
            <ReferrerStats stats={stats} />
          </StatsWrapper>

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
              // loading={loading}
            />
          </div>
        </>
      ) : (
        <div className="max-w-7xl mx-auto">
          <ReferrerForm
            key={currentReferrer ? currentReferrer._id : "new"}
            initialData={currentReferrer}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
          />
        </div>
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

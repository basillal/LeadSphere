import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import leadService from "../../services/leadService";
import LeadForm from "./LeadForm";
import followUpService from "../../services/followUpService";
import LeadsTable from "./LeadsTable";
import LeadStats from "./LeadStats";
import leadCategoryService from "../../services/leadCategoryService";
import { useData } from "../../context/DataContext";
import Toast from "../../components/common/utils/Toast";
import TimeRangeFilter, { getDateRange } from "../../components/common/TimeRangeFilter";
import StatsWrapper from "../../components/common/sections/StatsWrapper";

// Simple Modal for Preview (Tailwind based)
// We could use MUI Drawer/Dialog, but user asked for "removed all MUI" earlier, although some imports remain in this file.
// I will stick to a Tailwind-styled overlay to honor the "black theme" and "professional" request.
const PreviewModal = ({ lead, onClose }) => {
  if (!lead) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{lead.name}</h2>
            <p className="text-sm font-medium text-slate-500">
              {lead.organizationName || "No Organization"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-900 transition-colors"
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
          {/* Status Sections */}
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-1 bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-md uppercase tracking-wide">
              {lead.status}
            </div>
            <div className="px-3 py-1 bg-slate-100 text-slate-900 text-xs sm:text-sm font-semibold rounded-md">
              {lead.priority} Priority
            </div>
            <div className="px-3 py-1 bg-slate-100 text-slate-900 text-xs sm:text-sm font-semibold rounded-md">
              {lead.leadTemperature}
            </div>
            {lead.category && (
              <div className="px-3 py-1 text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wider">
                {lead.category.name}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                Contact Details
              </h3>
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold w-24 inline-block text-slate-900">
                    Phone:
                  </span>{" "}
                  {lead.phone}
                </p>
                <p>
                  <span className="font-semibold w-24 inline-block text-slate-900">
                    Email:
                  </span>{" "}
                  {lead.email}
                </p>
                <p>
                  <span className="font-semibold w-24 inline-block text-slate-900">
                    Alt Phone:
                  </span>{" "}
                  {lead.alternatePhone || "-"}
                </p>
                <p>
                  <span className="font-semibold w-24 inline-block text-slate-900">
                    Website:
                  </span>{" "}
                  {lead.website || "-"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                Source Info
              </h3>
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold w-24 inline-block text-slate-900">
                    Source:
                  </span>{" "}
                  {lead.source}
                </p>
                <p>
                  <span className="font-semibold w-24 inline-block text-slate-900">
                    Campaign:
                  </span>{" "}
                  {lead.campaignName || "-"}
                </p>
                <p>
                  <span className="font-semibold w-24 inline-block text-slate-900">
                    Referred By:
                  </span>{" "}
                  {lead.referredBy || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
              Business Requirement
            </h3>
            <p className="text-slate-700 bg-slate-50 p-4 rounded-md leading-relaxed border border-slate-100 text-sm font-medium">
              {lead.requirement || "No requirements specified."}
            </p>
          </div>

          {/* Deal Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-900 rounded-md text-white">
            <div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Deal Value</div>
              <div className="text-xs sm:text-sm font-semibold">{lead.dealValue || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Budget</div>
              <div className="text-xs sm:text-sm font-semibold">{lead.budgetRange || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Product</div>
              <div className="text-xs sm:text-sm font-semibold">
                {lead.interestedProduct || "-"}
              </div>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Closure</div>
              <div className="text-xs sm:text-sm font-semibold">
                {lead.expectedClosureDate
                  ? new Date(lead.expectedClosureDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-md hover:bg-slate-50 font-semibold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const Leads = () => {
  const { selectedOrganization } = useAuth();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    pending: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
    lost: 0,
    converted: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("list"); // 'list', 'create', 'edit'
  const [editingLead, setEditingLead] = useState(null);
  const [previewLead, setPreviewLead] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    source: "",
    category: "",
  });
  const { categories } = useData();
  const [timeRange, setTimeRange] = useState("last_30_days");

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch lead statistics
  const fetchStats = async (range) => {
    try {
      const params = {};
      const selectedRange = range || getDateRange(timeRange);
      if (selectedRange.startDate) params.startDate = selectedRange.startDate;
      if (selectedRange.endDate) params.endDate = selectedRange.endDate;

      const resp = await leadService.getLeadStats(params);
      setStats(resp.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Fetch lead statistics independently of lead list filters
  useEffect(() => {
    fetchStats();
  }, [selectedOrganization, timeRange]);

  // Debounce API calls for lead list
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search, filters.status, filters.source, filters.category, pagination.page, pagination.limit, selectedOrganization, timeRange]);

  const fetchLeads = async ({ page = pagination.page } = {}) => {
    // Set loading to true for every fetch to trigger the AdvancedTable overlay
    // setLoading(true);
    try {
      // Build params with pagination
      const params = {
        page,
        limit: pagination.limit,
      };

      // Add filters
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.source) params.source = filters.source;
      if (filters.category) params.category = filters.category;
      // The original content does not have `activeTab` state, so this line is commented out.
      // if (activeTab === "converted") params.isConverted = true;
      const selectedRange = getDateRange(timeRange);
      if (selectedRange.startDate) params.startDate = selectedRange.startDate;
      if (selectedRange.endDate) params.endDate = selectedRange.endDate;

      // Default to createdAt for general list filtering
      if (params.startDate || params.endDate) params.dateField = 'createdAt';

      const data = await leadService.getLeads(params);
      setLeads(data.data);

      // Update pagination metadata if available
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total || 0,
          pages: data.pagination.pages || 1,
        }));
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      // setError("Failed to fetch leads."); // Optional: Don't show error to prevent layout shift
    } finally {
      // setLoading(false);
    }
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

  const handleCreateLead = async (leadData) => {
    try {
      const payload = { ...leadData };
      if (selectedOrganization) {
        payload.organization = selectedOrganization;
      }
      const created = await leadService.createLead(payload);
      const createdLead = created?.data || created;

      // Show the new lead immediately, then refresh from the server.
      if (createdLead?._id) {
        setLeads((prev) => [
          createdLead,
          ...prev.filter((lead) => lead._id !== createdLead._id),
        ]);
        setPagination((prev) => ({
          ...prev,
          page: 1,
          total: prev.total + 1,
        }));
      }

      // Auto-create follow-up only when a follow-up date is provided and followUpMode is set
      if (payload.nextFollowUpDate && payload.followUpMode) {
        try {
          await followUpService.createFollowUp({
            lead: createdLead._id || createdLead.id,
            scheduledAt: payload.nextFollowUpDate,
            type: payload.followUpMode,
            notes: payload.followUpRemarks || ""
          });
        } catch (err) {
          console.error("Failed to auto-create follow-up:", err);
        }
      }
      showSnackbar("Lead added successfully", "success");
      await fetchLeads({ page: 1 });
      await fetchStats();
      setView("list");
    } catch (err) {
      console.error("Error creating lead:", err);
      const errMsg = err.response?.data?.message || "Failed to create lead";
      showSnackbar(errMsg, "error");
    }
  };

  const handleUpdateLead = async (leadData) => {
    try {
      await leadService.updateLead(leadData._id, leadData);
      showSnackbar("Lead updated successfully", "success");
      await fetchLeads();
      await fetchStats();
      setView("list");
      setEditingLead(null);
    } catch (err) {
      console.error("Error updating lead:", err);
      const errMsg = err.response?.data?.message || "Failed to update lead";
      showSnackbar(errMsg, "error");
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await leadService.deleteLead(id);
        showSnackbar("Lead deleted successfully", "success");
        await fetchLeads();
        await fetchStats();
      } catch (err) {
        console.error("Error deleting lead:", err);
        showSnackbar("Failed to delete lead", "error");
      }
    }
  };

  const handleShowCreate = () => {
    setEditingLead(null);
    setView("create");
  };

  const handleShowEdit = (lead) => {
    setEditingLead(lead);
    setView("edit");
  };

  const handleCancelForm = () => {
    setView("list");
    setEditingLead(null);
  };

  const handlePreview = (lead) => {
    setPreviewLead(lead);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 px-2 gap-3">
        <h1 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
          {view === "list"
            ? "Leads"
            : view === "create"
              ? "Create new lead"
              : "Edit lead"}
        </h1>
        <div className="flex gap-2">
          {view === "list" && (
            <TimeRangeFilter
              value={timeRange}
              onChange={setTimeRange}
            />
          )}
          {view !== "list" && (
            <button
              onClick={handleCancelForm}
              className="p-2 border border-slate-200 rounded-md text-slate-900 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md cursor-pointer"
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
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4 border border-red-200">
          {error}
        </div>
      )}

      {view === "list" ? (
        <>
          <StatsWrapper title="Leads Overview">
            <LeadStats stats={stats} />
          </StatsWrapper>

          <LeadsTable
            rows={leads}
            categories={categories}
            onCreate={handleShowCreate}
            onEdit={handleShowEdit}
            onDelete={handleDeleteLead}
            onPreview={handlePreview}
            filters={filters}
            onFilterChange={handleFilterChange}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          // loading={loading}
          />
        </>
      ) : (
        <div className="max-w-7xl mx-auto">
          <LeadForm
            key={editingLead ? editingLead._id : "new"}
            initialData={editingLead}
            onSubmit={view === "create" ? handleCreateLead : handleUpdateLead}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Custom Toast/Snackbar */}
      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />

      {/* Preview Modal */}
      <PreviewModal lead={previewLead} onClose={() => setPreviewLead(null)} />
    </div>
  );
};

export default Leads;

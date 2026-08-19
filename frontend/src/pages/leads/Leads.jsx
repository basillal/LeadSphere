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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              {lead.organizationName || "No Organization"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Sections */}
          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
              {lead.status}
            </div>
            <div className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
              {lead.priority} Priority
            </div>
            <div className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
              {lead.leadTemperature}
            </div>
            {lead.category && (
              <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                {lead.category.name}
              </div>
            )}
          </div>

          {/* Contact Info & Source Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">👤</div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contact Details
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">Phone</span>
                  <span className="text-gray-900 font-semibold">{lead.phone || "-"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">Email</span>
                  <span className="text-gray-900 font-semibold">{lead.email || "-"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">Alt Phone</span>
                  <span className="text-gray-900 font-semibold">{lead.alternatePhone || "-"}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-gray-500 font-medium">Website</span>
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold truncate max-w-[150px]">
                      {lead.website}
                    </a>
                  ) : (
                    <span className="text-gray-900 font-semibold">-</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">🌍</div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Source Info
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">Source</span>
                  <span className="text-gray-900 font-semibold">{lead.source || "-"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">Campaign</span>
                  <span className="text-gray-900 font-semibold">{lead.campaignName || "-"}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-gray-500 font-medium">Referred By</span>
                  <span className="text-gray-900 font-semibold">{lead.referredBy || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {lead.requirement && (
            <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">📝</div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Business Requirement
                </h3>
              </div>
              <p className="text-sm text-amber-900/80 leading-relaxed font-medium whitespace-pre-wrap">
                {lead.requirement}
              </p>
            </div>
          )}

          {/* Deal Stats */}
          <div className="bg-gray-900 rounded-xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gray-800 text-gray-300 rounded-lg">💼</div>
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Deal Details
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <span className="text-gray-400 block text-xs mb-1 uppercase font-medium">Deal Value</span>
                <p className="font-semibold text-sm">{lead.dealValue || "-"}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <span className="text-gray-400 block text-xs mb-1 uppercase font-medium">Budget</span>
                <p className="font-semibold text-sm">{lead.budgetRange || "-"}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <span className="text-gray-400 block text-xs mb-1 uppercase font-medium">Product</span>
                <p className="font-semibold text-sm">{lead.interestedProduct || "-"}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <span className="text-gray-400 block text-xs mb-1 uppercase font-medium">Closure</span>
                <p className="font-semibold text-sm text-blue-400">
                  {lead.expectedClosureDate
                    ? new Date(lead.expectedClosureDate).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {view === "list"
            ? "Leads"
            : view === "create"
              ? "Create New Lead"
              : "Edit Lead"}
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

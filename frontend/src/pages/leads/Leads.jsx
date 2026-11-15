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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm font-inter">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className="relative bg-white border border-gray-100 rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[85vh] max-h-[85dvh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 m-0">{lead.name}</h2>
            <p className="text-[10px] text-gray-500 m-0 mt-0.5">
              {lead.organizationName || "No Organization"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollbarWidth: "none" }}>
          {/* Status Sections */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-[#FFF1EB] text-[var(--primary)] border border-[var(--primary)]/20">
              {lead.status}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
              {lead.priority} Priority
            </span>
            {lead.leadTemperature && (
              <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                {lead.leadTemperature}
              </span>
            )}
            {lead.category && (
              <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]">
                {typeof lead.category === "object" ? lead.category.name : lead.category}
              </span>
            )}
          </div>

          {/* Contact Info & Source Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F8FAFC] rounded-[16px] p-4 border border-[#E2E8F0]">
              <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-[#8B92A5] block mb-2">
                Contact Details
              </span>
              <div className="space-y-2 text-[10.5px]">
                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                  <span className="text-[#64748B]">Phone</span>
                  <span className="text-[#111827] font-medium">{lead.phone || "-"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                  <span className="text-[#64748B]">Email</span>
                  <span className="text-[#111827] font-medium">{lead.email || "-"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                  <span className="text-[#64748B]">Alt Phone</span>
                  <span className="text-[#111827] font-medium">{lead.alternatePhone || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Website</span>
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline font-medium truncate max-w-[160px]"
                    >
                      {lead.website}
                    </a>
                  ) : (
                    <span className="text-[#111827] font-medium">-</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-[16px] p-4 border border-[#E2E8F0]">
              <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-[#8B92A5] block mb-2">
                Source &amp; Referral
              </span>
              <div className="space-y-2 text-[10.5px]">
                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                  <span className="text-[#64748B]">Source</span>
                  <span className="text-[#111827] font-medium">{lead.source || "Direct"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                  <span className="text-[#64748B]">Campaign</span>
                  <span className="text-[#111827] font-medium">{lead.campaignName || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Referred By</span>
                  <span className="text-[#111827] font-medium">{lead.referredBy || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Business Requirement */}
          {lead.requirement && (
            <div className="bg-[#FFFBEB] rounded-[16px] p-4 border border-[#FDE68A]">
              <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-[#B45309] block mb-1">
                Business Requirement
              </span>
              <p className="text-[10.5px] text-[#92400E] leading-relaxed m-0 whitespace-pre-wrap">
                {lead.requirement}
              </p>
            </div>
          )}

          {/* Deal Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white rounded-[12px] p-3 border border-[#E2E8F0]">
              <span className="text-[9px] uppercase tracking-wider text-[#8B92A5] block mb-0.5">Deal Value</span>
              <p className="font-semibold text-[11px] text-[#111827] m-0">{lead.dealValue || "-"}</p>
            </div>
            <div className="bg-white rounded-[12px] p-3 border border-[#E2E8F0]">
              <span className="text-[9px] uppercase tracking-wider text-[#8B92A5] block mb-0.5">Budget</span>
              <p className="font-semibold text-[11px] text-[#111827] m-0">{lead.budgetRange || "-"}</p>
            </div>
            <div className="bg-white rounded-[12px] p-3 border border-[#E2E8F0]">
              <span className="text-[9px] uppercase tracking-wider text-[#8B92A5] block mb-0.5">Product</span>
              <p className="font-semibold text-[11px] text-[#111827] m-0">{lead.interestedProduct || "-"}</p>
            </div>
            <div className="bg-white rounded-[12px] p-3 border border-[#E2E8F0]">
              <span className="text-[9px] uppercase tracking-wider text-[#8B92A5] block mb-0.5">Closure</span>
              <p className="font-semibold text-[11px] text-[#111827] m-0">
                {lead.expectedClosureDate
                  ? new Date(lead.expectedClosureDate).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="em-btn-clear"
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

      // Auto-create follow-up is handled by backend to prevent duplicates.
      showSnackbar("Lead added successfully", "success");
      
      setView("list");
      // Use setTimeout to allow the view transition before fetching, preventing race conditions or UI lag
      setTimeout(() => {
        fetchLeads({ page: 1 });
        fetchStats();
      }, 0);
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
    <div className="w-full font-inter">
      {/* Header Block & Spacing Hierarchy */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-[13px] font-semibold text-gray-900 m-0">
              {view === "list"
                ? "Lead Management"
                : view === "create"
                  ? "Create New Lead"
                  : "Edit Lead Details"}
            </h1>
            <p className="text-[10.5px] text-gray-500 m-0 mt-0.5">
              {view === "list"
                ? "Track and manage sales opportunities, source channels, and conversions."
                : "Enter prospect contact information, requirement details, and assigned rep."}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {view === "list" ? (
              <>
                <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
                <button
                  type="button"
                  onClick={handleShowCreate}
                  className="em-add"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                  <span>New Lead</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCancelForm}
                className="em-btn-clear"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                </svg>
                <span>Back to List</span>
              </button>
            )}
          </div>
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

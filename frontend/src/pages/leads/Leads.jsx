import React, { useState, useEffect } from "react";
import leadService from "../../services/leadService";
import LeadForm from "./LeadForm";
import LeadsTable from "./LeadsTable";
import Toast from "../../components/common/utils/Toast";

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
            <p className="text-sm text-gray-500">
              {lead.companyName || "No Company"}
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
          {/* Status Sections */}
          <div className="flex flex-wrap gap-4">
            <div className="px-3 py-1 bg-black text-white text-sm font-semibold rounded-full uppercase tracking-wide">
              {lead.status}
            </div>
            <div className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
              {lead.priority} Priority
            </div>
            <div className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
              {lead.leadTemperature}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Contact Details
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="font-semibold w-24 inline-block text-gray-500">
                    Phone:
                  </span>{" "}
                  {lead.phone}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-24 inline-block text-gray-500">
                    Email:
                  </span>{" "}
                  {lead.email}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-24 inline-block text-gray-500">
                    Alt Phone:
                  </span>{" "}
                  {lead.alternatePhone || "-"}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-24 inline-block text-gray-500">
                    Website:
                  </span>{" "}
                  {lead.website || "-"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Source Info
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="font-semibold w-24 inline-block text-gray-500">
                    Source:
                  </span>{" "}
                  {lead.source}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-24 inline-block text-gray-500">
                    Campaign:
                  </span>{" "}
                  {lead.campaignName || "-"}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-24 inline-block text-gray-500">
                    Referred By:
                  </span>{" "}
                  {lead.referredBy || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Business Requirement
            </h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed border border-gray-100">
              {lead.requirement || "No requirements specified."}
            </p>
          </div>

          {/* Deal Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-900 rounded-xl text-white">
            <div>
              <div className="text-xs text-gray-400 uppercase">Deal Value</div>
              <div className="text-lg font-bold">{lead.dealValue || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase">Budget</div>
              <div className="text-lg font-bold">{lead.budgetRange || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase">Product</div>
              <div className="text-lg font-bold">
                {lead.interestedProduct || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase">Closure</div>
              <div className="text-lg font-bold">
                {lead.expectedClosureDate
                  ? new Date(lead.expectedClosureDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>
          </div>
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

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    source: "",
  });

  const [view, setView] = useState("list"); // 'list', 'create', 'edit'
  const [editingLead, setEditingLead] = useState(null);
  const [previewLead, setPreviewLead] = useState(null); // For preview Modal

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Debounce API calls, but update UI immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const fetchLeads = async () => {
    // setLoading(true); // Don't show full page spinner on filter
    try {
      // Remove empty filters before sending
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== ""),
      );
      const data = await leadService.getLeads(params);
      setLeads(data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      // setError("Failed to fetch leads."); // Optional: Don't show error to prevent layout shift
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateLead = async (leadData) => {
    try {
      await leadService.createLead(leadData);
      showSnackbar("Lead added successfully", "success");
      fetchLeads();
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
      fetchLeads();
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
        fetchLeads();
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
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {view === "list"
            ? "Leads"
            : view === "create"
              ? "Create New Lead"
              : "Edit Lead"}
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

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          {view === "list" && (
            <LeadsTable
              rows={leads}
              onCreate={handleShowCreate}
              onEdit={handleShowEdit}
              onDelete={handleDeleteLead}
              onPreview={handlePreview}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          )}
          {(view === "create" || view === "edit") && (
            <div className="max-w-7xl mx-auto">
              <LeadForm
                key={editingLead ? editingLead._id : "new"}
                initialData={editingLead}
                onSubmit={
                  view === "create" ? handleCreateLead : handleUpdateLead
                }
                onCancel={handleCancelForm}
              />
            </div>
          )}
        </>
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

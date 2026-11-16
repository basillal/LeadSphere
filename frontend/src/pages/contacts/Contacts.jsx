import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import contactService from "../../services/contactService";
import leadService from "../../services/leadService"; 
import leadCategoryService from "../../services/leadCategoryService"; // New Import
import { useData } from "../../context/DataContext";
import ContactStats from "./ContactStats";
import ContactsTable from "./ContactsTable";
import ContactForm from "./ContactForm";
import ConversionDialog from "../leads/ConversionDialog"; // Importing from leads for reuse, or should move it to common? Keeping it here for now.
import Toast from "../../components/common/utils/Toast";
import StatsWrapper from "../../components/common/sections/StatsWrapper";
import Loader from "../../components/common/Loader";
import { formatDate, formatDateTime } from "../../utils/dateUtils";

// Preview Modal Component
const PreviewModal = ({ contact, onClose }) => {
  if (!contact) return null;

  const getTagColor = (tag) => {
    const colors = {
      Client: "bg-blue-50 text-blue-700 border-blue-200",
      Vendor: "bg-purple-50 text-purple-700 border-purple-200",
      Partner: "bg-green-50 text-green-700 border-green-200",
      Friend: "bg-orange-50 text-orange-700 border-orange-200",
      Other: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[tag] || colors.Other;
  };

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
            <h2 className="text-[14px] font-semibold text-gray-900 m-0">{contact.name}</h2>
            <p className="text-[10px] text-gray-500 m-0 mt-0.5">
              {contact.organizationName || "No Organization"}
              {contact.designation && <span className="mx-1.5">•</span>}
              {contact.designation && <span>{contact.designation}</span>}
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
          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">👤</div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Details</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">Phone</span>
                  <span className="text-gray-900 font-semibold">{contact.phone || "-"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">Email</span>
                  <span className="text-gray-900 font-semibold">{contact.email || "-"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">Alt Phone</span>
                  <span className="text-gray-900 font-semibold">{contact.alternatePhone || "-"}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-gray-500 font-medium">Website</span>
                  {contact.website ? (
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold truncate max-w-[150px]">
                      {contact.website}
                    </a>
                  ) : (
                    <span className="text-gray-900 font-semibold">-</span>
                  )}
                </div>
              </div>
            </div>

            {/* Relationship */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">🏢</div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Relationship</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">Category</span>
                  <span className="text-gray-900 font-semibold">{contact.category?.name || "-"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500 font-medium">Industry</span>
                  <span className="text-gray-900 font-semibold">{contact.industry || "-"}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-gray-500 font-medium">Organization Size</span>
                  <span className="text-gray-900 font-semibold">{contact.organizationSize || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interaction History */}
          <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">🕒</div>
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Interaction History</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                <div className="text-xs text-indigo-500 uppercase mb-1 font-medium">Last Contact</div>
                <div className="text-sm font-semibold text-indigo-900">{formatDate(contact.lastInteractionDate)}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                <div className="text-xs text-indigo-500 uppercase mb-1 font-medium">Via</div>
                <div className="text-sm font-semibold text-indigo-900">{contact.lastInteractionType || "-"}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                <div className="text-xs text-indigo-500 uppercase mb-1 font-medium">Next Follow-up</div>
                <div className="text-sm font-semibold text-blue-600">{formatDateTime(contact.nextFollowUpDate)}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">📝</div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Notes</h3>
              </div>
              <p className="text-sm text-amber-900/80 leading-relaxed whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {/* Social Profiles */}
          {(contact.linkedInProfile || contact.twitterHandle || contact.facebookProfile) && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gray-100 text-gray-600 rounded-lg">🔗</div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Social Profiles</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {contact.linkedInProfile && (
                  <a href={contact.linkedInProfile} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#0077b5] text-white text-sm font-medium rounded-lg hover:bg-[#006396] transition-colors flex items-center gap-2">
                    <span>in</span> LinkedIn
                  </a>
                )}
                {contact.twitterHandle && (
                  <a href={`https://twitter.com/${contact.twitterHandle.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#1DA1F2] text-white text-sm font-medium rounded-lg hover:bg-[#1a91da] transition-colors flex items-center gap-2">
                    <span>𝕏</span> Twitter
                  </a>
                )}
                {contact.facebookProfile && (
                  <a href={contact.facebookProfile} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#1877F2] text-white text-sm font-medium rounded-lg hover:bg-[#166fe5] transition-colors flex items-center gap-2">
                    <span>f</span> Facebook
                  </a>
                )}
              </div>
            </div>
          )}
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

// Lead Selection View for Conversion
const LeadSelectionView = ({ onCancel, onSelect, categories = [] }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchLeads = useCallback(async () => {
    try {
      // Fetch only unconverted leads
      const response = await leadService.getLeads({
        limit: 100,
        search,
        category: categoryFilter, // Added category filter
        excludeConverted: true,
      });

      // Filter out 'Lost' leads client-side if needed, or we could add that to backend too
      // User Request: Only show "Completed" leads for conversion
      const unconverted = response.data.filter(
        (l) => l.status && l.status.trim() === "Completed",
      );
      setLeads(unconverted);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col w-full max-w-4xl mx-auto h-[70vh]">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Select Lead to Convert
          </h2>
          <p className="text-sm text-gray-500 mt-1">Choose a completed lead to convert into a contact.</p>
        </div>
        <button
          onClick={onCancel}
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

        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              />
              <button
                onClick={fetchLeads}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm shadow-sm"
              >
                Search
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Filter Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative bg-gray-50/30">
          {leads.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 border border-gray-100 rounded-xl m-4">
              <div className="text-4xl mb-3">📭</div>
              <h3 className="text-lg font-medium text-gray-900">No leads found</h3>
              <p className="text-sm text-gray-500 mt-1">There are no completed leads available for conversion.</p>
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead._id}
                onClick={() => onSelect(lead)}
                className="p-5 border border-gray-200 rounded-xl hover:border-gray-900 hover:shadow-md cursor-pointer transition-all flex justify-between items-center group bg-white mx-2"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-sm text-gray-600 font-medium">
                      {lead.organizationName || "-"}
                    </p>
                    {lead.category && (
                      <span 
                        className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm border border-black/5 inline-flex items-center gap-1.5`}
                        style={{ 
                          backgroundColor: typeof lead.category === 'object' ? lead.category.color : '',
                          color: (function(hex) {
                            if (!hex) return 'white';
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            const yiq = (r * 299 + g * 587 + b * 114) / 1000;
                            return yiq >= 128 ? 'black' : 'white';
                          })(typeof lead.category === 'object' ? lead.category.color : '')
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                        {typeof lead.category === 'object' ? lead.category.name : ''}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 bg-gray-900 px-4 py-2 rounded-lg shadow-sm">
                  Select Lead →
                </span>
              </div>
            ))
          )}
        </div>
      </div>
  );
};

const Contacts = () => {
  const { selectedOrganization } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    clients: 0,
    vendors: 0,
    partners: 0,
    friends: 0,
    recentInteractions: 0,
  });
  // const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list"); 
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const { categories } = useData();
  const [currentContact, setCurrentContact] = useState(null);
  const [previewContact, setPreviewContact] = useState(null);

  // Conversion States
  const [convertingLead, setConvertingLead] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filters, setFilters] = useState({
    search: "",
    tag: "",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleStartConversion = () => {
    setView("selectLead");
  };

  const handleSelectLead = (lead) => {
    setConvertingLead(lead);
    setView("convertLead");
  };

  const handleCancelConversion = () => {
    setConvertingLead(null);
    setView("list");
  };

  const handleConfirmConversion = async (additionalData) => {
    try {
      await contactService.convertLeadToContact(
        convertingLead._id,
        additionalData,
      );
      showSnackbar("Lead converted to contact successfully", "success");
      setConvertingLead(null);
      setView("list");
      fetchContacts();
      fetchStats();
    } catch (err) {
      console.error("Error converting lead:", err);
      const errMsg =
        err.response?.data?.message || "Failed to convert lead to contact";
      showSnackbar(errMsg, "error");
    }
  };

  const fetchContacts = useCallback(async () => {
    // setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;

      // Set tag filter based on active tab
      if (activeTab !== "all") {
        params.tag = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      } else if (filters.tag) {
        params.tag = filters.tag;
      }

      const response = await contactService.getContacts(params);
      setContacts(response.data);
      if (response.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total || 0,
          pages: response.pagination.pages || 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      showSnackbar("Failed to fetch contacts", "error");
    } finally {
      // setLoading(false);
    }
  }, [filters, activeTab, pagination.page, pagination.limit]);

  const fetchStats = async () => {
    try {
      const response = await contactService.getContactStats();
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
      fetchContacts();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, activeTab, pagination.page, pagination.limit, selectedOrganization]);

  const handleCreate = () => {
    setCurrentContact(null);
    setView("create");
  };

  const handleEdit = (contact) => {
    setCurrentContact(contact);
    setView("edit");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await contactService.deleteContact(id);
        showSnackbar("Contact deleted successfully", "success");
        fetchContacts();
        fetchStats();
      } catch (error) {
        console.error("Error deleting contact:", error);
        showSnackbar("Failed to delete contact", "error");
      }
    }
  };

  const handleView = (contact) => {
    navigate(`/contacts/${contact._id}`);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (currentContact) {
        await contactService.updateContact(currentContact._id, data);
        showSnackbar("Contact updated successfully", "success");
      } else {
        const payload = { ...data };
        if (selectedOrganization) {
          payload.organization = selectedOrganization;
        }
        await contactService.createContact(payload);
        showSnackbar("Contact created successfully", "success");
      }
      setView("list");
      setCurrentContact(null);
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error("Error saving contact:", error);
      const errMsg = error.response?.data?.message || "Failed to save contact";
      showSnackbar(errMsg, "error");
    }
  };

  const handleCancelForm = () => {
    setView("list");
    setCurrentContact(null);
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

  const tabs = [
    { id: "all", label: "All Contacts" },
    { id: "client", label: "Clients" },
    { id: "vendor", label: "Vendors" },
    { id: "partner", label: "Partners" },
    { id: "friend", label: "Friends" },
  ];

  return (
    <div className="w-full font-inter">
      {/* Header Block & Spacing Hierarchy */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-[13px] font-semibold text-gray-900 m-0">
              {view === "list"
                ? "Contact Directory"
                : view === "create"
                  ? "Create New Contact"
                  : view === "edit"
                    ? "Edit Contact Details"
                    : view === "selectLead"
                      ? "Convert Lead to Contact"
                      : "Convert to Contact"}
            </h1>
            <p className="text-[10.5px] text-gray-500 m-0 mt-0.5">
              {view === "list"
                ? "Manage customer accounts, vendor stakeholders, and communication records."
                : "Manage profile details, company affiliations, and contact tags."}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {view === "list" ? (
              <>
                <button
                  type="button"
                  onClick={() => setView("selectLead")}
                  className="em-btn-clear"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Convert Lead</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView("create")}
                  className="em-add"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                  <span>New Contact</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (view === "convertLead") {
                    setView("selectLead");
                    setConvertingLead(null);
                  } else {
                    handleCancelForm();
                    handleCancelConversion();
                  }
                }}
                className="em-btn-clear"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                </svg>
                <span>{view === "convertLead" ? "Back to Leads" : "Back to List"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {view === "list" ? (
        <>
          <ContactStats stats={stats} />

          {/* Quick Filter Tabs & Layout Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              <div className="flex items-center gap-1.5 min-w-max">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-1.5 h-[30px] px-3.5 rounded-full text-[10.5px] font-medium transition-all ${
                        isActive
                          ? "bg-[#111827] text-white shadow-sm"
                          : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center self-end sm:self-auto bg-white border border-[#E5E7EB] rounded-full p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-[#111827] text-white"
                    : "text-[#64748B] hover:text-[#111827]"
                }`}
                title="Table List View"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                </svg>
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-[#111827] text-white"
                    : "text-[#64748B] hover:text-[#111827]"
                }`}
                title="Directory Cards Grid"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Directory</span>
              </button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div>
              {contacts.length === 0 ? (
                <div className="em-card p-12 text-center text-gray-500 text-[11px]">
                  No contacts found matching your criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact._id}
                      onClick={() => handleView(contact)}
                      className="em-card p-4 hover:border-gray-300 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        {/* Top: Avatar + Name + Co */}
                        <div className="flex items-start justify-between gap-2.5 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[#FFF1EB] text-[var(--primary)] text-[12px] font-bold flex items-center justify-center shrink-0">
                              {contact.name ? contact.name.charAt(0).toUpperCase() : "C"}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-[12px] font-semibold text-gray-900 truncate m-0">
                                {contact.name}
                              </h3>
                              <p className="text-[10px] text-gray-400 truncate m-0">
                                {contact.designation || "Contact"} • {contact.organizationName || "-"}
                              </p>
                            </div>
                          </div>

                          {contact.category?.name && (
                            <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF] px-2 py-0.5 text-[9px] font-semibold shrink-0">
                              {contact.category.name}
                            </span>
                          )}
                        </div>

                        {/* Contact Chips */}
                        <div className="space-y-1 mb-3">
                          {contact.phone && (
                            <div className="flex items-center gap-1.5 text-[10.5px] text-gray-600">
                              <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="truncate">{contact.phone}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-1.5 text-[10.5px] text-gray-600">
                              <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="truncate">{contact.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mb-3">
                            {contact.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Ribbon */}
                      <div
                        className="flex items-center justify-between pt-2.5 border-t border-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleView(contact)}
                          className="text-[10px] font-medium text-[var(--primary)] hover:underline"
                        >
                          View Profile →
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(contact)}
                            className="em-icon-btn em-icon-edit"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(contact._id)}
                            className="em-icon-btn em-icon-delete"
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Grid Pagination Footer */}
              {pagination.pages > 1 && (
                <div className="mt-4 px-4 py-2 em-card flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} contacts)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="h-[28px] px-3 rounded-lg border border-gray-200 text-[10px] font-medium text-gray-700 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="h-[28px] px-3 rounded-lg border border-gray-200 text-[10px] font-medium text-gray-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ContactsTable
              contacts={contacts}
              categories={categories} // Pass categories
              onCreate={() => setView("create")}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              filters={filters}
              onFilterChange={handleFilterChange}
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              handleStartConversion={handleStartConversion}
              // loading={loading}
            />
          )}
        </>
      ) : view === "selectLead" ? (
        <LeadSelectionView
          categories={categories}
          onCancel={handleCancelConversion}
          onSelect={handleSelectLead}
        />
      ) : view === "convertLead" && convertingLead ? (
        <div className="max-w-3xl mx-auto mt-4">
          <ConversionDialog
            lead={convertingLead}
            categories={categories}
            onConfirm={handleConfirmConversion}
            onCancel={handleCancelConversion}
            inline={true}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <ContactForm
            key={currentContact ? currentContact._id : "new"}
            initialData={currentContact}
            categories={categories}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Preview Modal */}
      <PreviewModal
        contact={previewContact}
        onClose={() => setPreviewContact(null)}
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

export default Contacts;

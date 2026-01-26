import React, { useState, useEffect, useCallback } from "react";
import contactService from "../../services/contactService";
import ContactStats from "./ContactStats";
import ContactsTable from "./ContactsTable";
import ContactForm from "./ContactForm";
import Toast from "../../components/common/utils/Toast";

// Preview Modal Component
const PreviewModal = ({ contact, onClose }) => {
  if (!contact) return null;

  const getTagColor = (tag) => {
    const colors = {
      Client: "bg-blue-100 text-blue-800",
      Vendor: "bg-purple-100 text-purple-800",
      Partner: "bg-green-100 text-green-800",
      Friend: "bg-orange-100 text-orange-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[tag] || colors.Other;
  };

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
            <h2 className="text-xl font-bold text-gray-900">{contact.name}</h2>
            <p className="text-sm text-gray-500">
              {contact.companyName || "No Company"}{" "}
              {contact.designation && `• ${contact.designation}`}
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
          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

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
                  {contact.phone}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-32 inline-block text-gray-500">
                    Email:
                  </span>{" "}
                  {contact.email || "-"}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-32 inline-block text-gray-500">
                    Alt Phone:
                  </span>{" "}
                  {contact.alternatePhone || "-"}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-32 inline-block text-gray-500">
                    Website:
                  </span>{" "}
                  {contact.website || "-"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Relationship
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="font-semibold w-32 inline-block text-gray-500">
                    Type:
                  </span>{" "}
                  {contact.relationshipType || "Business"}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-32 inline-block text-gray-500">
                    Industry:
                  </span>{" "}
                  {contact.industry || "-"}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold w-32 inline-block text-gray-500">
                    Company Size:
                  </span>{" "}
                  {contact.companySize || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Interaction History */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Interaction History
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-900 rounded-xl text-white">
              <div>
                <div className="text-xs text-gray-400 uppercase">
                  Last Contact
                </div>
                <div className="text-sm font-bold">
                  {formatDate(contact.lastInteractionDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase">Via</div>
                <div className="text-sm font-bold">
                  {contact.lastInteractionType || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase">
                  Next Follow-up
                </div>
                <div className="text-sm font-bold">
                  {formatDate(contact.nextFollowUpDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Notes
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed border border-gray-100">
                {contact.notes}
              </p>
            </div>
          )}

          {/* Social Profiles */}
          {(contact.linkedInProfile ||
            contact.twitterHandle ||
            contact.facebookProfile) && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Social Profiles
              </h3>
              <div className="flex gap-3">
                {contact.linkedInProfile && (
                  <a
                    href={contact.linkedInProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    LinkedIn
                  </a>
                )}
                {contact.twitterHandle && (
                  <a
                    href={`https://twitter.com/${contact.twitterHandle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium"
                  >
                    Twitter
                  </a>
                )}
                {contact.facebookProfile && (
                  <a
                    href={contact.facebookProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors text-sm font-medium"
                  >
                    Facebook
                  </a>
                )}
              </div>
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

const Contacts = () => {
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
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list"); // 'list', 'create', 'edit'
  const [currentContact, setCurrentContact] = useState(null);
  const [previewContact, setPreviewContact] = useState(null);
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

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.search) params.search = filters.search;

      // Set tag filter based on active tab
      if (activeTab !== "all") {
        params.tag = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      } else if (filters.tag) {
        params.tag = filters.tag;
      }

      const response = await contactService.getContacts(params);
      setContacts(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 1,
      }));
    } catch (error) {
      console.error("Error fetching contacts:", error);
      showSnackbar("Failed to fetch contacts", "error");
    } finally {
      setLoading(false);
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchContacts]);

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
    setPreviewContact(contact);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (currentContact) {
        await contactService.updateContact(currentContact._id, data);
        showSnackbar("Contact updated successfully", "success");
      } else {
        await contactService.createContact(data);
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
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {view === "list"
            ? "Contacts"
            : view === "create"
              ? "Create New Contact"
              : "Edit Contact"}
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
              <ContactStats stats={stats} />

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

              {/* Contacts Table */}
              <div className="pb-20">
                <ContactsTable
                  contacts={contacts}
                  onCreate={handleCreate}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              </div>
            </>
          )}

          {(view === "create" || view === "edit") && (
            <div className="max-w-7xl mx-auto">
              <ContactForm
                key={currentContact ? currentContact._id : "new"}
                initialData={currentContact}
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

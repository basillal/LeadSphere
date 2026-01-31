import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import contactService from "../../services/contactService";
import leadService from "../../services/leadService";
import followUpService from "../../services/followUpService";
import activityService from "../../services/activityService";
import billingService from "../../services/billingService";
import Toast from "../../components/common/utils/Toast";

const ContactDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState(null);
  const [lead, setLead] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [billings, setBillings] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Contact
      const contactResponse = await contactService.getContact(id);
      const contactData = contactResponse.data;
      setContact(contactData);

      // 2. Fetch Related Data
      const promises = [
        // Fetch Contact Activities
        activityService
          .getActivitiesByRelated("Contact", id)
          .catch(() => ({ data: [] })),
        // Fetch Billings
        billingService
          .getBillings({ contactId: id })
          .catch(() => ({ data: [] })),
      ];

      if (contactData.leadId) {
        // Use leadId string if it's an object (populated) or string
        const leadId =
          typeof contactData.leadId === "object"
            ? contactData.leadId._id
            : contactData.leadId;

        if (leadId) {
          promises.push(
            leadService.getLead(leadId).catch(() => ({ data: null })),
          );
          promises.push(
            followUpService
              .getLeadFollowUps(leadId)
              .catch(() => ({ data: [] })),
          );
          promises.push(
            activityService
              .getActivitiesByRelated("Lead", leadId)
              .catch(() => ({ data: [] })),
          );
        }
      }

      const results = await Promise.all(promises);

      // Process results
      const contactActivities = results[0].data || [];
      const billingsData = results[1].data || [];

      let leadData = null;
      let leadFollowUps = [];
      let leadActivities = [];

      if (contactData.leadId) {
        leadData = results[2]?.data || null;
        leadFollowUps = results[3]?.data || [];
        leadActivities = results[4]?.data || [];
      }

      setBillings(billingsData);

      setLead(leadData);
      // Sort follow-ups by scheduledAt descending
      const sortedFollowUps = (leadFollowUps || []).sort(
        (a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt),
      );
      setFollowUps(sortedFollowUps);

      // Merge and sort activities
      const allActivities = [...contactActivities, ...leadActivities].sort(
        (a, b) => new Date(b.activityDate) - new Date(a.activityDate),
      );

      // Deduplicate activities if any (by _id)
      const uniqueActivities = Array.from(
        new Map(allActivities.map((item) => [item._id, item])).values(),
      );

      setActivities(uniqueActivities);
    } catch (error) {
      console.error("Error fetching contact details:", error);
      showSnackbar("Failed to fetch contact details", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Contact not found</h2>
        <button
          onClick={() => navigate("/contacts")}
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Back to Contacts
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/contacts")}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {contact.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                {contact.companyName && (
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {contact.companyName}
                  </span>
                )}
                {contact.designation && (
                  <>
                    <span>•</span>
                    <span>{contact.designation}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm flex items-center gap-2"
              onClick={() => {
                /* Ideally open edit modal or navigate to edit, keeping it simple for now */
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto mt-8 flex gap-6 overflow-x-auto scrollbar-hide">
          {[
            "overview",
            "lead-info",
            "activities",
            "follow-ups",
            "billings",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900 font-medium">{contact.phone}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <p className="text-gray-900 font-medium">
                      {contact.email || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Alternate Phone
                    </label>
                    <p className="text-gray-900">
                      {contact.alternatePhone || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Website
                    </label>
                    <a
                      href={
                        contact.website
                          ? contact.website.startsWith("http")
                            ? contact.website
                            : `https://${contact.website}`
                          : "#"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline truncate block"
                    >
                      {contact.website || "-"}
                    </a>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Relationship Type
                    </label>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800`}
                    >
                      {contact.relationshipType}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags &&
                        contact.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      {(!contact.tags || contact.tags.length === 0) && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Industry
                    </label>
                    <p className="text-gray-900">{contact.industry || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Company Size
                    </label>
                    <p className="text-gray-900">
                      {contact.companySize || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {contact.address &&
                (contact.address.street ||
                  contact.address.city ||
                  contact.address.state ||
                  contact.address.country) && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      Address
                    </h2>
                    <p className="text-gray-700">
                      {contact.address.street && (
                        <span className="block">{contact.address.street}</span>
                      )}
                      {(contact.address.city ||
                        contact.address.state ||
                        contact.address.zipCode) && (
                        <span className="block">
                          {[
                            contact.address.city,
                            contact.address.state,
                            contact.address.zipCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                      {contact.address.country && (
                        <span className="block">{contact.address.country}</span>
                      )}
                    </p>
                  </div>
                )}

              {/* Attachments */}
              {contact.attachments && contact.attachments.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Attachments
                  </h2>
                  <ul className="space-y-2">
                    {contact.attachments.map((file, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-blue-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        <a
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate max-w-xs"
                        >
                          {file.split("/").pop() || "Attachment " + (idx + 1)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes */}
              {contact.notes && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Notes
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {contact.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Engagement
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Last Interaction
                    </label>
                    <p className="text-gray-900 font-medium">
                      {formatDate(contact.lastInteractionDate)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {contact.lastInteractionType &&
                        `Via ${contact.lastInteractionType}`}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Next Follow-up
                    </label>
                    <p
                      className={`font-medium ${new Date(contact.nextFollowUpDate) < new Date() ? "text-red-600" : "text-gray-900"}`}
                    >
                      {formatDate(contact.nextFollowUpDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Profiles */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Social Profiles
                </h2>
                <div className="space-y-3">
                  {contact.linkedInProfile && (
                    <a
                      href={contact.linkedInProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        LI
                      </span>
                      <span className="truncate flex-1">LinkedIn</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                  {contact.twitterHandle && (
                    <a
                      href={`https://twitter.com/${contact.twitterHandle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-sky-500 transition-colors"
                    >
                      <span className="p-2 bg-sky-50 text-sky-500 rounded-lg">
                        TW
                      </span>
                      <span className="truncate flex-1">Twitter</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                  {contact.facebookProfile && (
                    <a
                      href={contact.facebookProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-800 transition-colors"
                    >
                      <span className="p-2 bg-blue-50 text-blue-800 rounded-lg">
                        FB
                      </span>
                      <span className="truncate flex-1">Facebook</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                  {!contact.linkedInProfile &&
                    !contact.twitterHandle &&
                    !contact.facebookProfile && (
                      <p className="text-sm text-gray-500">
                        No social profiles added
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lead Info Tab */}
        {activeTab === "lead-info" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Original Lead Details
            </h2>
            {lead ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Lead Source
                  </label>
                  <p className="text-gray-900">
                    {lead.sourceName || "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                    {lead.status}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Captured At
                  </label>
                  <p className="text-gray-900">{formatDate(lead.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Converted At
                  </label>
                  <p className="text-gray-900">
                    {formatDate(lead.convertedAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Original Owner
                  </label>
                  <p className="text-gray-900">
                    {lead.ownerName || lead.createdBy?.name || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Lead Score
                  </label>
                  <p className="text-gray-900">{lead.leadScore || 0}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                This contact is not associated with any lead data.
              </div>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === "activities" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Activity History
              </h2>
              {/* Could add filter controls here */}
            </div>

            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div
                          className={`mt-1 p-2 rounded-lg flex items-center justify-center h-10 w-10 
                                        ${
                                          activity.activityType === "Call"
                                            ? "bg-blue-100 text-blue-600"
                                            : activity.activityType ===
                                                "Meeting"
                                              ? "bg-purple-100 text-purple-600"
                                              : activity.activityType ===
                                                  "Email"
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                        >
                          {/* Icons based on type */}
                          {activity.activityType === "Call" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                          )}
                          {activity.activityType === "Meeting" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {activity.activityType === "Email" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          )}
                          {activity.activityType !== "Call" &&
                            activity.activityType !== "Meeting" &&
                            activity.activityType !== "Email" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>{formatDate(activity.activityDate)}</span>
                            <span>•</span>
                            <span>{activity.status}</span>
                            {activity.outcome && (
                              <>
                                <span>•</span>
                                <span>{activity.outcome}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {activity.relatedTo} Reference
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>No activities found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Follow Ups Tab */}
        {activeTab === "follow-ups" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Follow Up Schedule
              </h2>
            </div>
            <div className="space-y-4">
              {followUps.length > 0 ? (
                followUps.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold uppercase 
                                        ${
                                          item.status === "Pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : item.status === "Completed"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-800"
                                        }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {formatDate(item.scheduledAt)}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                    <div>{/* Actions like mark complete can go here */}</div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>No follow-ups scheduled.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Billings Tab */}
        {activeTab === "billings" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Invoices & Billing
              </h2>
              <button
                onClick={() => navigate("/billings")}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Create New Invoice
              </button>
            </div>
            {billings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">Invoice #</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Mode</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {billings.map((bill) => (
                      <tr key={bill._id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">
                          {bill.invoiceNumber}
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {new Date(bill.billingDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 font-medium">
                          ₹{bill.grandTotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              bill.paymentStatus === "PAID"
                                ? "bg-green-100 text-green-800"
                                : bill.paymentStatus === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500">
                          {bill.paymentMode}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() =>
                              window.open(
                                `/print/invoice/${bill._id}`,
                                "_blank",
                              )
                            }
                            className="text-gray-500 hover:text-black transition-colors"
                            title="Print Invoice"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                No invoices found for this contact.
              </div>
            )}
          </div>
        )}

        {/* Toast Notification */}
        <Toast
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        />
      </div>
    </div>
  );
};

export default ContactDetails;

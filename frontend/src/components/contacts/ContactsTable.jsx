import React, { useState } from "react";
import ContactCard from "./ContactCard";

const ContactsTable = ({
  contacts,
  onCreate,
  onEdit,
  onDelete,
  onView,
  filters,
  onFilterChange,
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full">
      {/* Filters and Search */}
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search contacts..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <select
          value={filters.tag}
          onChange={(e) => onFilterChange("tag", e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
        >
          <option value="">All Tags</option>
          <option value="Client">Client</option>
          <option value="Vendor">Vendor</option>
          <option value="Partner">Partner</option>
          <option value="Friend">Friend</option>
          <option value="Other">Other</option>
        </select>
        <button
          onClick={onCreate}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium whitespace-nowrap"
        >
          + Add Contact
        </button>
      </div>

      {/* Mobile View - Cards */}
      {isMobile ? (
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No contacts found</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <ContactCard
                key={contact._id}
                contact={contact}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            ))
          )}
        </div>
      ) : (
        /* Desktop View - Table */
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Interaction
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <p className="text-gray-500">No contacts found</p>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr
                      key={contact._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">
                            {contact.name}
                          </span>
                          {contact.designation && (
                            <span className="text-xs text-gray-500">
                              {contact.designation}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {contact.companyName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {contact.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {contact.email || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags && contact.tags.length > 0 ? (
                            contact.tags.map((tag, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">
                              No tags
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(contact.lastInteractionDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onView(contact)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => onEdit(contact)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDelete(contact._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!isMobile && pagination && (
        <div className="mt-4 px-4 py-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span>{" "}
              contacts
            </div>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center px-4 py-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </div>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Mobile Pagination */}
      {isMobile && pagination && contacts.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactsTable;

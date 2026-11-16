import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import billingService from "../../services/billingService";
import serviceService from "../../services/serviceService";
import contactService from "../../services/contactService";
import leadCategoryService from "../../services/leadCategoryService";
import { useData } from "../../context/DataContext";
import Toast from "../../components/common/utils/Toast";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";
import ContactForm from "../contacts/ContactForm";
import TimeRangeFilter, { getDateRange } from "../../components/common/TimeRangeFilter";
import { formatDate } from "../../utils/dateUtils";

const BillingForm = ({ initialData, onSubmit, onCancel }) => {
  const [contacts, setContacts] = useState([]);
  const { services } = useData();

  const [formData, setFormData] = useState({
    contactId: "",
    services: [], // { serviceId, serviceName, quantity, unitAmount, taxAmount, totalAmount }
    billingDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentStatus: "PENDING",
    paymentMode: "BANK",
    notes: "",
    discount: 0,
  });

  const [contactSearch, setContactSearch] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [isContactFocused, setIsContactFocused] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (initialData) {
          setFormData({
            ...initialData,
            contactId: initialData.contact?._id || initialData.contact,
            billingDate: initialData.billingDate.split("T")[0],
            dueDate: initialData.dueDate
              ? initialData.dueDate.split("T")[0]
              : "",
            services: (initialData.services || []).map((s) => ({
              serviceId: s.serviceId?._id || s.serviceId,
              serviceName: s.serviceName,
              quantity: s.quantity,
              unitAmount: s.unitAmount,
              taxAmount: s.taxAmount,
              totalAmount: s.totalAmount,
            })),
          });
          if (initialData.contact?.name) {
            setContactSearch(initialData.contact.name);
          }
        }
      } catch (err) {
        console.error("Error loading form data", err);
      }
    };
    loadData();
  }, [initialData]);

  useEffect(() => {
    const searchContacts = async () => {
      if (!contactSearch.trim()) return;
      try {
        const res = await contactService.getContacts({
          search: contactSearch,
          limit: 10,
        });
        setContacts(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    const timer = setTimeout(searchContacts, 300);
    return () => clearTimeout(timer);
  }, [contactSearch]);

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          serviceId: "",
          serviceName: "",
          quantity: 1,
          unitAmount: 0,
          taxAmount: 0,
          totalAmount: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleServiceChange = (index, serviceId) => {
    const service = services.find((s) => s._id === serviceId);
    if (!service) return;

    const newServices = [...formData.services];
    newServices[index] = {
      ...newServices[index],
      serviceId: service._id,
      serviceName: service.serviceName,
      unitAmount: service.baseAmount,
      taxAmount: (service.baseAmount * (service.taxPercentage || 0)) / 100,
    };
    setFormData({ ...formData, services: newServices });
  };

  const totals = formData.services.reduce(
    (acc, item) => {
      const lineTotal = item.quantity * item.unitAmount;
      const itemTax = item.taxAmount * item.quantity;
      return {
        subtotal: acc.subtotal + lineTotal,
        tax: acc.tax + itemTax,
      };
    },
    { subtotal: 0, tax: 0 }
  );

  const grandTotal = totals.subtotal + totals.tax - (formData.discount || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      services: formData.services.map((s) => ({
        ...s,
        taxAmount: s.taxAmount * s.quantity,
        totalAmount: s.unitAmount * s.quantity + s.taxAmount * s.quantity,
      })),
    };
    onSubmit(payload);
  };

  const handleContactSuccess = async (newContact) => {
    setShowContactModal(false);
    setContacts([]);
    setFormData((prev) => ({ ...prev, contactId: newContact._id }));
    setContactSearch(newContact.name);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="em-card p-4 md:p-6 bg-white rounded-[24px] border border-gray-100 max-w-5xl mx-auto flex flex-col gap-5"
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-gray-100 gap-3">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 tracking-tight">
              {initialData ? "Edit Invoice" : "Create New Invoice"}
            </h2>
            <p className="text-[10.5px] text-gray-400 mt-0.5">
              {initialData
                ? "Modify invoice details, items, or payment terms."
                : "Fill in client, line items, and billing details to generate an invoice."}
            </p>
          </div>
          {initialData && (
            <button
              type="button"
              onClick={() =>
                window.open(`/print/invoice/${initialData._id}`, "_blank")
              }
              className="em-btn-clear h-[34px] px-3.5 inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
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
              <span>Print Invoice</span>
            </button>
          )}
        </div>

        {/* Client & Date Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left: Client Selection */}
          <div className="md:col-span-8 bg-gray-50/70 p-4 rounded-[16px] border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Bill To (Client) *
              </label>
              {!initialData && (
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="text-[10.5px] text-[var(--primary)] hover:underline font-semibold flex items-center gap-1"
                >
                  + Add New Contact
                </button>
              )}
            </div>

            {!initialData ? (
              <div className="relative">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search Client by Name or Phone..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    onFocus={() => setIsContactFocused(true)}
                    onBlur={() => setTimeout(() => setIsContactFocused(false), 200)}
                    className="w-full h-[34px] pl-9 pr-3 text-[11px] font-medium bg-white border border-[#D1D5DB] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                {contacts.length > 0 && isContactFocused && !formData.contactId && (
                  <ul className="absolute z-20 w-full bg-white border border-gray-200 mt-1 rounded-[12px] shadow-lg max-h-56 overflow-y-auto divide-y divide-gray-50">
                    {contacts.map((c) => (
                      <li
                        key={c._id}
                        onClick={() => {
                          setFormData({ ...formData, contactId: c._id });
                          setContactSearch(c.name);
                          setContacts([]);
                        }}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-[11px]"
                      >
                        <div className="font-semibold text-gray-900">{c.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {c.organizationName ? `${c.organizationName} • ` : ""}
                          {c.email || c.phone}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {formData.contactId && (
                  <div className="mt-2.5 flex items-center justify-between bg-emerald-50 px-3 py-2 rounded-[10px] border border-emerald-100">
                    <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Selected: {contactSearch}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, contactId: "" });
                        setContactSearch("");
                      }}
                      className="text-[10px] text-rose-600 hover:underline font-semibold"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-white border border-gray-200 rounded-[10px]">
                <div className="text-[11px] font-semibold text-gray-900">{initialData.contact?.name}</div>
                <div className="text-[10px] text-gray-400">{initialData.contact?.organizationName}</div>
              </div>
            )}
          </div>

          {/* Right: Dates */}
          <div className="md:col-span-4 space-y-3">
            <div>
              <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
                Billing Date *
              </label>
              <input
                type="date"
                value={formData.billingDate}
                onChange={(e) =>
                  setFormData({ ...formData, billingDate: e.target.value })
                }
                className="w-full h-[34px] px-3 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full h-[34px] px-3 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-gray-100 rounded-[16px] overflow-hidden">
          <div className="bg-gray-50/70 px-4 py-2.5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Line Items
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-[10.5px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              + Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[9px] text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-2 font-semibold min-w-[200px]">Service</th>
                  <th className="px-3 py-2 font-semibold w-24 min-w-[80px]">Qty</th>
                  <th className="px-3 py-2 font-semibold w-32 min-w-[100px]">Price (₹)</th>
                  <th className="px-3 py-2 font-semibold w-32 text-right min-w-[100px]">Total (₹)</th>
                  <th className="px-3 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {formData.services.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-gray-400 text-[11px]">
                      No items added yet. Click "+ Add Item" to specify invoice line items.
                    </td>
                  </tr>
                ) : (
                  formData.services.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-2.5">
                        <select
                          value={item.serviceId}
                          onChange={(e) => handleServiceChange(index, e.target.value)}
                          className="w-full h-[32px] px-2.5 border border-[#D1D5DB] rounded-[8px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                        >
                          <option value="">Select Service</option>
                          {services.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.serviceName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newServices = [...formData.services];
                            newServices[index].quantity = parseInt(e.target.value) || 1;
                            setFormData({ ...formData, services: newServices });
                          }}
                          className="w-full h-[32px] px-2 border border-[#D1D5DB] rounded-[8px] text-[11px] font-medium text-center focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          min="0"
                          value={item.unitAmount}
                          onChange={(e) => {
                            const newServices = [...formData.services];
                            newServices[index].unitAmount = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, services: newServices });
                          }}
                          className="w-full h-[32px] px-2 border border-[#D1D5DB] rounded-[8px] text-[11px] font-medium text-right focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-gray-900 text-[11px]">
                        ₹{(item.quantity * item.unitAmount).toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="em-icon-btn em-icon-delete"
                          title="Remove Item"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
                Notes & Terms
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows="3"
                className="w-full p-2.5 text-[11px] font-medium border border-[#D1D5DB] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                placeholder="Payment instructions, bank details, or terms..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentStatus: e.target.value })
                  }
                  className="w-full h-[34px] px-3 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
                  Payment Mode
                </label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMode: e.target.value })
                  }
                  className="w-full h-[34px] px-3 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option value="BANK">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/80 rounded-[16px] p-4 space-y-2.5 border border-gray-100 flex flex-col justify-between">
            <h3 className="font-semibold text-gray-800 text-[11px] border-b border-gray-200 pb-2">
              Payment Summary
            </h3>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-800">
                  ₹{totals.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span className="font-semibold text-gray-800">
                  ₹{totals.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-24 h-[28px] px-2 text-right border border-[#D1D5DB] rounded-[6px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="text-[12px] font-bold text-gray-900">
                Grand Total
              </span>
              <span className="text-[16px] font-bold text-[var(--primary)]">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2.5 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="em-btn-clear h-[34px] px-5 text-[11px] font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.contactId || formData.services.length === 0}
            className="em-add h-[34px] px-6 text-[11px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {initialData ? "Update Invoice" : "Generate Invoice"}
          </button>
        </div>
      </form>

      {/* Add Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowContactModal(false)} />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[88dvh] overflow-y-auto z-10 border border-gray-100 flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-[14px] font-semibold text-gray-900">
                Add New Contact
              </h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <ContactForm
                onCancel={() => setShowContactModal(false)}
                onSubmit={(data) => {
                  contactService
                    .createContact(data)
                    .then((res) => {
                      handleContactSuccess(res.data);
                    })
                    .catch((err) => {
                      console.error(err);
                      alert("Failed to create contact");
                    });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Billings = () => {
  const { selectedOrganization } = useAuth();
  const [billings, setBillings] = useState([]);
  const [view, setView] = useState("list");
  const [currentBilling, setCurrentBilling] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { categories } = useData();
  const [filters, setFilters] = useState({
    search: "",
    paymentStatus: "",
    category: "",
  });
  const [timeRange, setTimeRange] = useState("last_30_days");

  const fetchBillings = async () => {
    try {
      const params = {};
      const range = getDateRange(timeRange);
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      
      const res = await billingService.getBillings(params);
      setBillings(res.data || []);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to load invoices",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchBillings();
  }, [selectedOrganization, timeRange, filters.category, filters.paymentStatus, filters.search]);

  const handleCreate = () => {
    setCurrentBilling(null);
    setView("create");
  };

  const handleEdit = (billing) => {
    setCurrentBilling(billing);
    setView("edit");
  };

  const handleSubmit = async (data) => {
    try {
      if (currentBilling) {
        await billingService.updateBilling(currentBilling._id, data);
        setSnackbar({
          open: true,
          message: "Invoice updated successfully",
          severity: "success",
        });
      } else {
        const payload = { ...data };
        if (selectedOrganization) {
          payload.organization = selectedOrganization;
        }
        const res = await billingService.createBilling(payload);
        setSnackbar({
          open: true,
          message: "Invoice generated successfully",
          severity: "success",
        });

        if (res.data && res.data._id) {
          window.open(`/print/invoice/${res.data._id}`, "_blank");
        }
      }
      setView("list");
      fetchBillings();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Operation failed",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await billingService.deleteBilling(id);
        setSnackbar({
          open: true,
          message: "Invoice deleted",
          severity: "success",
        });
        fetchBillings();
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Failed to delete",
          severity: "error",
        });
      }
    }
  };

  const billingStats = useMemo(() => {
    let totalInvoiced = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;

    billings.forEach((b) => {
      const amt = Number(b.grandTotal) || 0;
      totalInvoiced += amt;
      if (b.paymentStatus === "PAID") paidAmount += amt;
      else if (b.paymentStatus === "OVERDUE") overdueAmount += amt;
      else pendingAmount += amt;
    });

    return { totalInvoiced, paidAmount, pendingAmount, overdueAmount };
  }, [billings]);

  const columns = [
    { 
      id: "invoiceNumber", 
      label: "Invoice #",
      render: (row) => (
        <span className="font-mono text-[10.5px] font-semibold text-gray-900 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-[6px] whitespace-nowrap">
          {row.invoiceNumber || "-"}
        </span>
      )
    },
    {
      id: "contact",
      label: "Client / Account",
      render: (row) => (
        <span className="font-semibold text-gray-900 text-[11px] whitespace-nowrap">
          {row.contact?.name || "Client"}
        </span>
      ),
    },
    {
      id: "organization",
      label: "Organization",
      render: (row) => (
        <span className="text-[10.5px] text-gray-600 whitespace-nowrap">
          {row.organization?.name || "-"}
        </span>
      ),
    },
    {
      id: "billingDate",
      label: "Issue Date",
      render: (row) => (
        <span className="text-[10.5px] text-gray-600 whitespace-nowrap">
          {formatDate(row.billingDate)}
        </span>
      ),
    },
    {
      id: "grandTotal",
      label: "Total Amount",
      render: (row) => (
        <span className="font-bold text-gray-900 text-[11.5px] whitespace-nowrap">
          ₹{(row.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: "paymentStatus",
      label: "Payment Status",
      render: (row) => {
        const map = {
          PAID: "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]",
          PENDING: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
          PARTIAL: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
          OVERDUE: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
        };
        return (
          <span
            className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9.5px] font-semibold border ${
              map[row.paymentStatus] || "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
            }`}
          >
            {row.paymentStatus}
          </span>
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2 px-1">
        <div>
          <h1 className="text-[13px] font-semibold text-gray-900 tracking-tight">
            {view === "list" ? "Billing & Invoices" : view === "create" ? "Create Invoice" : "Edit Invoice"}
          </h1>
          <p className="text-[10.5px] text-gray-400 mt-0.5">
            {view === "list"
              ? "Generate client billing statements, log payments, and print invoices."
              : "Specify client, line items, taxes, and payment conditions."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {view === "list" ? (
            <>
              <TimeRangeFilter
                value={timeRange}
                onChange={setTimeRange}
              />
              <button
                onClick={handleCreate}
                className="em-add h-[34px] px-4 inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Invoice</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setView("list")}
              className="em-btn-clear h-[34px] px-3.5 inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18-6-6 6-6" />
              </svg>
              <span>Back to list</span>
            </button>
          )}
        </div>
      </div>

      {view === "list" ? (
        <>
          {/* Financial Revenue Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            {/* Total Invoiced */}
            <div className="bg-[#111827] text-white rounded-[18px] p-3.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-gray-400">
                  Total Invoiced
                </span>
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-[12px] font-bold">
                  ₹
                </span>
              </div>
              <div>
                <div className="text-[18px] sm:text-[20px] font-bold leading-tight">
                  ₹{billingStats.totalInvoiced.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-[9.5px] text-gray-400 m-0 mt-0.5">
                  {billings.length} billing statements
                </p>
              </div>
            </div>

            {/* Paid / Collected */}
            <div className="bg-white border border-gray-100 rounded-[18px] p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#15803D]">
                  Collected Revenue
                </span>
                <div className="w-7 h-7 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-[18px] sm:text-[20px] font-bold text-[#15803D] leading-tight">
                  ₹{billingStats.paidAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-[9.5px] text-gray-400 m-0 mt-0.5">
                  Received in bank
                </p>
              </div>
            </div>

            {/* Pending Collection */}
            <div className="bg-white border border-gray-100 rounded-[18px] p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#B45309]">
                  Pending Collection
                </span>
                <div className="w-7 h-7 rounded-full bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-[18px] sm:text-[20px] font-bold text-[#B45309] leading-tight">
                  ₹{billingStats.pendingAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-[9.5px] text-gray-400 m-0 mt-0.5">
                  Awaiting payment
                </p>
              </div>
            </div>

            {/* Overdue */}
            <div className={`rounded-[18px] p-3.5 border transition-all flex flex-col justify-between ${
              billingStats.overdueAmount > 0
                ? "bg-[#FEF2F2] border-[#FECACA] shadow-sm"
                : "bg-white border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-semibold tracking-[0.08em] uppercase ${
                  billingStats.overdueAmount > 0 ? "text-[#DC2626]" : "text-[#8B92A5]"
                }`}>
                  Overdue Receivables
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  billingStats.overdueAmount > 0 ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-gray-100 text-gray-500"
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className={`text-[18px] sm:text-[20px] font-bold leading-tight ${
                  billingStats.overdueAmount > 0 ? "text-[#B91C1C]" : "text-gray-900"
                }`}>
                  ₹{billingStats.overdueAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </div>
                <p className={`text-[9.5px] m-0 mt-0.5 ${
                  billingStats.overdueAmount > 0 ? "text-[#DC2626] font-medium" : "text-gray-400"
                }`}>
                  {billingStats.overdueAmount > 0 ? "Requires follow-up" : "Zero overdue"}
                </p>
              </div>
            </div>
          </div>

          <AdvancedTable
            data={billings}
            columns={columns}
            actions={[
              {
                label: "Edit",
                onClick: handleEdit,
                color: "em-icon-edit",
              },
              {
                label: "Print",
                onClick: (row) =>
                  window.open(`/print/invoice/${row._id}`, "_blank"),
                color: "em-icon-view",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                ),
              },
              {
                label: "Delete",
                onClick: (row) => handleDelete(row._id),
                color: "em-icon-delete",
              },
            ]}
            toolbar={{
              title: "Invoice Ledger",
              search: {
                value: filters.search,
                onChange: (v) => setFilters((prev) => ({ ...prev, search: v })),
              },
              filters: [
                {
                  value: filters.paymentStatus,
                  onChange: (v) => setFilters((prev) => ({ ...prev, paymentStatus: v })),
                  options: [
                    { value: "", label: "Payment status" },
                    { value: "PAID", label: "Paid" },
                    { value: "PENDING", label: "Pending" },
                    { value: "PARTIAL", label: "Partial" },
                    { value: "OVERDUE", label: "Overdue" },
                  ],
                },
                {
                  value: filters.category,
                  onChange: (v) => setFilters((prev) => ({ ...prev, category: v })),
                  options: [
                    { value: "", label: "All Categories" },
                    ...categories.map((cat) => ({ value: cat._id, label: cat.name })),
                  ],
                },
              ],
            }}
            emptyMessage="No invoices found."
          />
        </>
      ) : (
        <div className="max-w-5xl mx-auto w-full">
          <BillingForm
            initialData={currentBilling}
            onSubmit={handleSubmit}
            onCancel={() => setView("list")}
          />
        </div>
      )}

      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </div>
  );
};

export default Billings;
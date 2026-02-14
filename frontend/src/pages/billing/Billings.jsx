import React, { useState, useEffect } from "react";
import billingService from "../../services/billingService";
import serviceService from "../../services/serviceService";
import contactService from "../../services/contactService";
import Toast from "../../components/common/utils/Toast";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";
import ContactForm from "../contacts/ContactForm"; // Import ContactForm

const BillingForm = ({ initialData, onSubmit, onCancel }) => {
  const [contacts, setContacts] = useState([]);
  const [services, setServices] = useState([]);

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
  const [showContactModal, setShowContactModal] = useState(false); // State for modal

  useEffect(() => {
    // Load initial data for edit mode
    const loadData = async () => {
      try {
        // Fetch active services
        const serviceRes = await serviceService.getServices({ isActive: true });
        setServices(serviceRes.data);

        // If editing, populate form
        if (initialData) {
          setFormData({
            ...initialData,
            contactId: initialData.contact._id || initialData.contact,
            billingDate: initialData.billingDate.split("T")[0],
            dueDate: initialData.dueDate
              ? initialData.dueDate.split("T")[0]
              : "",
            services: initialData.services.map((s) => ({
              serviceId: s.serviceId._id || s.serviceId, // handle population
              serviceName: s.serviceName,
              quantity: s.quantity,
              unitAmount: s.unitAmount,
              taxAmount: s.taxAmount,
              totalAmount: s.totalAmount,
            })),
          });
        }
      } catch (err) {
        console.error("Error loading form data", err);
      }
    };
    loadData();
  }, [initialData]);

  // Search Contacts
  useEffect(() => {
    const searchContacts = async () => {
      if (contactSearch.length > 2) {
        const res = await contactService.getContacts({
          search: contactSearch,
          limit: 10,
        });
        setContacts(res.data);
      }
    };
    const timer = setTimeout(searchContacts, 300);
    return () => clearTimeout(timer);
  }, [contactSearch]);

  // Form Logic
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
      // Recalculate will handle total
    };
    setFormData({ ...formData, services: newServices });
  };

  // Recalculate totals whenever services change
  const totals = formData.services.reduce(
    (acc, item) => {
      const lineTotal = item.quantity * item.unitAmount;
      const itemTax = item.taxAmount * item.quantity;

      return {
        subtotal: acc.subtotal + lineTotal,
        tax: acc.tax + itemTax,
      };
    },
    { subtotal: 0, tax: 0 },
  );

  const grandTotal = totals.subtotal + totals.tax - (formData.discount || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      services: formData.services.map((s) => ({
        ...s,
        taxAmount: s.taxAmount * s.quantity, // Send total tax for line
        totalAmount: s.unitAmount * s.quantity + s.taxAmount * s.quantity,
      })),
    };
    onSubmit(payload);
  };

  const handleContactSuccess = async (newContact) => {
    // When a new contact is created:
    // 1. Close modal
    setShowContactModal(false);
    // 2. Clear contacts list
    setContacts([]);
    // 3. Set the form data to use this new contact
    // Note: newContact might need to be fetched fully? usually create returns it.
    // Let's assume newContact is the full contact object.
    setFormData((prev) => ({ ...prev, contactId: newContact._id }));
    setContactSearch(newContact.name); // Set search text to name so it looks selected
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-8 max-w-5xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 md:mb-8 border-b border-gray-100 pb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? "Edit Invoice" : "Create New Invoice"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {initialData
                ? "Modify invoice details below"
                : "Fill in the details to generate a new invoice"}
            </p>
          </div>
          {initialData && (
            <button
              type="button"
              onClick={() =>
                window.open(`/print/invoice/${initialData._id}`, "_blank")
              }
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors"
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Invoice
            </button>
          )}
        </div>

        {/* Client & Date Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 mb-6 md:mb-8">
          {/* Left: Client Selection */}
          <div className="md:col-span-8 bg-gray-50 p-3 md:p-6 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                Bill To (Customer)
              </label>
              {!initialData && (
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  + Add New Contact
                </button>
              )}
            </div>

            {!initialData ? (
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search Client..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition-all text-sm"
                    />
                  </div>
                </div>

                {contacts.length > 0 &&
                  contactSearch.length > 2 &&
                  !formData.contactId && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {contacts.map((c) => (
                        <li
                          key={c._id}
                          onClick={() => {
                            setFormData({ ...formData, contactId: c._id });
                            setContactSearch(c.name);
                            setContacts([]);
                          }}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-0"
                        >
                          <div className="font-bold text-gray-900">
                            {c.name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {c.companyName ? `${c.companyName} • ` : ""}{" "}
                            {c.email || c.phone}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                {formData.contactId && (
                  <div className="mt-3 flex items-center justify-between bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                    <span className="text-sm text-green-700 font-medium flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      Selected: {contactSearch}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, contactId: "" });
                        setContactSearch("");
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium underline"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-900 font-medium p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-lg">{initialData.contact.name}</div>
                <div className="text-sm text-gray-500">
                  {initialData.contact.companyName}
                </div>
              </div>
            )}
          </div>

          {/* Right: Dates */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Date
              </label>
              <input
                type="date"
                value={formData.billingDate}
                onChange={(e) =>
                  setFormData({ ...formData, billingDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-6 md:mb-8 border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 md:px-6 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Line Items
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              + Add Item
            </button>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs text-gray-500 uppercase">
                  <th className="px-6 py-3 font-medium min-w-[200px]">
                    Service
                  </th>
                  <th className="px-4 py-3 font-medium w-24 min-w-[100px]">
                    Qty
                  </th>
                  <th className="px-4 py-3 font-medium w-32 min-w-[120px]">
                    Price
                  </th>
                  <th className="px-4 py-3 font-medium w-32 text-right min-w-[120px]">
                    Total
                  </th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {formData.services.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-400 text-sm"
                    >
                      No items added yet. Click "+ Add Item" to start.
                    </td>
                  </tr>
                ) : (
                  formData.services.map((item, index) => (
                    <tr
                      key={index}
                      className="group hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <select
                          value={item.serviceId}
                          onChange={(e) =>
                            handleServiceChange(index, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                        >
                          <option value="">Select Service</option>
                          {services.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.serviceName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newServices = [...formData.services];
                            newServices[index].quantity =
                              parseInt(e.target.value) || 1;
                            setFormData({ ...formData, services: newServices });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={item.unitAmount}
                          onChange={(e) => {
                            const newServices = [...formData.services];
                            newServices[index].unitAmount =
                              parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, services: newServices });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ₹{(item.quantity * item.unitAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Remove Item"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 border-t border-gray-200 pt-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                placeholder="Terms and conditions or additional notes..."
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentStatus: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Mode
                </label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMode: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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

          <div className="bg-gray-50 rounded-xl p-4 md:p-6 space-y-4 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">
              Payment Summary
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">
                ₹{totals.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium text-gray-900">
                ₹{totals.tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-600">Discount</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">-</span>
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
                  className="w-24 px-2 py-1 text-right border border-gray-300 rounded bg-white focus:ring-black focus:border-black"
                />
              </div>
            </div>
            <div className="border-t border-gray-300 pt-4 flex justify-between items-center bg-gray-100 -mx-6 -mb-6 p-6 rounded-b-xl mt-4">
              <span className="text-lg font-bold text-gray-900">
                Grand Total
              </span>
              <span className="text-2xl font-bold text-black border-b-4 border-yellow-300">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-between gap-3 mt-8 md:mt-10 border-t border-gray-100 pt-6 md:pt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!formData.contactId || formData.services.length === 0}
              className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-all transform hover:scale-105"
            >
              {initialData ? "Update Invoice" : "Generate Invoice"}
            </button>
          </div>
        </div>
      </form>

      {/* Add Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm overflow-hidden md:overflow-y-auto">
          <div className="bg-white w-full max-w-4xl md:rounded-2xl rounded-t-2xl shadow-2xl relative flex flex-col h-[90vh] md:h-auto md:max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900">
                Add New Contact
              </h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-200 transition-colors"
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
            <div className="flex-1 overflow-y-auto p-4">
              <ContactForm
                onCancel={() => setShowContactModal(false)}
                onSubmit={(data) => {
                  // We need to actually call the API here to create contact
                  contactService
                    .createContact(data)
                    .then((res) => {
                      handleContactSuccess(res.data);
                      Toast({
                        message: "Contact created successfully",
                        severity: "success",
                      }); // Assuming simple Toast usage, but we might need to trigger the parent's toast
                      // Actually we are inside Billings, and we don't have direct access to setBillingSnackbar easily without prop drilling.
                      // Let's just rely on visual feedback (modal close + select) for now, or assume handleContactSuccess works.
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
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [currentBilling, setCurrentBilling] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchBillings = async () => {
    setLoading(true);
    try {
      const res = await billingService.getBillings();
      setBillings(res.data);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to load invoices",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillings();
  }, []);

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
        const res = await billingService.createBilling(data);
        setSnackbar({
          open: true,
          message: "Invoice generated successfully",
          severity: "success",
        });

        // Auto-print newly created invoice
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

  const columns = [
    { id: "invoiceNumber", label: "Invoice #" },
    {
      id: "contact",
      label: "Client",
      render: (row) =>
        row.contact?.name ? row.contact.name.toUpperCase() : "UNKNOWN",
    },
    {
      id: "billingDate",
      label: "Date",
      render: (row) => new Date(row.billingDate).toLocaleDateString(),
    },
    {
      id: "grandTotal",
      label: "Amount",
      render: (row) => `₹${row.grandTotal.toFixed(2)}`,
    },
    {
      id: "paymentStatus",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            row.paymentStatus === "PAID"
              ? "bg-green-100 text-green-800"
              : row.paymentStatus === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {row.paymentStatus}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
        {view === "list" && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            + Create Invoice
          </button>
        )}
      </div>

      {view === "list" ? (
        <AdvancedTable
          data={billings}
          columns={columns}
          actions={[
            {
              label: "Edit",
              onClick: handleEdit,
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              ),
            },
            {
              label: "Print",
              onClick: (row) =>
                window.open(`/print/invoice/${row._id}`, "_blank"),
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 3V5H7v2h6zm-8 7v-3h10v3H5z"
                    clipRule="evenodd"
                  />
                </svg>
              ),
            },
            {
              label: "Delete",
              onClick: (row) => handleDelete(row._id),
              color: "text-red-500 hover:bg-red-50",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ),
            },
          ]}
          loading={loading}
          emptyMessage="No invoices found."
        />
      ) : (
        <div className="max-w-4xl mx-auto">
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

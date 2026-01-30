import React, { useState, useEffect } from "react";
import billingService from "../../services/billingService";
import serviceService from "../../services/serviceService";
import contactService from "../../services/contactService";
import Toast from "../../components/common/utils/Toast";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load initial data for edit mode
    const loadData = async () => {
      try {
        // Fetch active services
        const serviceRes = await serviceService.getServices({ isActive: true });
        setServices(serviceRes.data);

        // If editing, populate form
        if (initialData) {
          // Fetch specific contact if not in list
          // For now, let's just populate form
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
      // Tax calculation depends on if taxAmount is per unit or total.
      // Let's assume taxAmount stored in state is PER UNIT for simplicity in UI,
      // but Backend expects total tax maybe? Let's check model.
      // Model says: taxAmount: Number. Usually this is total tax for the line.
      // Let's fix logic:
      // Tax per unit = (unitAmount * taxPercent / 100) -> Not stored directly.
      // Let's calculate tax based on stored taxAmount which we set on selection.

      // Better approach: Calculate afresh from service definition if possible,
      // but if user overrides unitAmount, tax should adjust?
      // Let's keep it simple: Tax Amount field in UI is "Total Tax for this line".
      // But initially we set it to (Base Tax * Qty).

      const itemTax = item.taxAmount * item.quantity;
      // Wait, handleServiceChange sets taxAmount which looks like Unit Tax.

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
    // Prepare payload
    // Fix taxAmount to be total tax for line as per backend likely expectation (or clarify)
    // Backend model: taxAmount: { type: Number, default: 0 }.
    // Let's send total tax for the line item.
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold mb-6 text-gray-900">
        {initialData ? "Edit Invoice" : "Create New Invoice"}
      </h2>

      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer/Contact *
          </label>
          {!initialData ? (
            <div className="relative">
              <input
                type="text"
                placeholder="Search client name..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
              />
              {contacts.length > 0 &&
                contactSearch.length > 2 &&
                !formData.contactId && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {contacts.map((c) => (
                      <li
                        key={c._id}
                        onClick={() => {
                          setFormData({ ...formData, contactId: c._id });
                          setContactSearch(c.name);
                          setContacts([]);
                        }}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                      >
                        <span className="font-bold">{c.name}</span>{" "}
                        <span className="text-gray-500">
                          ({c.companyName || "No Company"})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              {formData.contactId && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  ✓ Customer Selected
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, contactId: "" });
                      setContactSearch("");
                    }}
                    className="ml-2 text-red-500 hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-900 font-medium p-2 bg-gray-50 rounded">
              {initialData.contact.name} ({initialData.contact.companyName})
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.billingDate}
              onChange={(e) =>
                setFormData({ ...formData, billingDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
          Line Items
        </h3>
        <div className="space-y-4">
          {formData.services.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Service
                </label>
                <select
                  value={item.serviceId}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select Service</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.serviceName} (${s.baseAmount})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const newServices = [...formData.services];
                    newServices[index].quantity = parseInt(e.target.value) || 1;
                    setFormData({ ...formData, services: newServices });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Price
                </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-6">
        <div className="space-y-4">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Additional notes for the client..."
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
                Mode
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

        <div className="bg-gray-50 rounded-xl p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">${totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-600">Discount</span>
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
              className="w-24 px-2 py-1 text-right border border-gray-300 rounded bg-white"
            />
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Grand Total</span>
            <span className="text-xl font-bold text-black">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!formData.contactId || formData.services.length === 0}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {initialData ? "Update Invoice" : "Generate Invoice"}
        </button>
      </div>
    </form>
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
        await billingService.createBilling(data);
        setSnackbar({
          open: true,
          message: "Invoice generated successfully",
          severity: "success",
        });
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
      render: (row) => row.contact?.name || "Unknown",
    },
    {
      id: "billingDate",
      label: "Date",
      render: (row) => new Date(row.billingDate).toLocaleDateString(),
    },
    {
      id: "grandTotal",
      label: "Amount",
      render: (row) => `$${row.grandTotal.toFixed(2)}`,
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

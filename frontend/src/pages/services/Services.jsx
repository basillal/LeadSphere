import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import serviceService from "../../services/serviceService";
import Toast from "../../components/common/utils/Toast";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";

const ServiceForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    serviceName: "",
    serviceCode: "",
    industryType: "Education",
    baseAmount: "",
    taxPercentage: 0,
    description: "",
    customFields: {},
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        customFields: initialData.customFields || {},
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCustomFieldChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Fields based on Industry
  const getIndustryFields = () => {
    switch (formData.industryType) {
      case "Education":
        return [
          "Program Duration",
          "Certification Body",
          "Qualification Level",
          "Mode of Delivery",
        ];
      case "IT":
        return [
          "Technology Stack",
          "Service Level Agreement (SLA)",
          "Engagement Model",
          "Support Tier",
        ];
      case "Healthcare":
        return [
          "Specialization",
          "Consultation Type",
          "Facility Code",
          "Insurance Coverage",
        ];
      case "Real Estate":
        return [
          "Property Type",
          "Zoning Classification",
          "Total Area (sq ft)",
          "Ownership Status",
        ];
      case "Finance":
        return [
          "Interest Rate (%)",
          "Term Duration",
          "Risk Category",
          "Collateral Requirement",
        ];
      default:
        return ["Service Category", "Tags"];
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="em-card p-4 md:p-6 bg-white rounded-[24px] border border-gray-100 max-w-3xl mx-auto flex flex-col gap-4"
    >
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-[14px] font-semibold text-gray-900 tracking-tight">
          {initialData ? "Edit Service" : "Create New Service"}
        </h2>
        <p className="text-[10.5px] text-gray-400 mt-0.5">
          Configure service name, pricing, industry specifications, and taxation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
            Service Name *
          </label>
          <input
            type="text"
            name="serviceName"
            value={formData.serviceName}
            onChange={handleChange}
            required
            className="w-full h-[34px] px-3 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
            Service Code *
          </label>
          <input
            type="text"
            name="serviceCode"
            value={formData.serviceCode}
            onChange={handleChange}
            required
            placeholder="e.g. SRV-001"
            className="w-full h-[34px] px-3 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 uppercase"
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
            Industry Type *
          </label>
          <select
            name="industryType"
            value={formData.industryType}
            onChange={handleChange}
            className="w-full h-[34px] px-3 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            {[
              "Education",
              "IT",
              "Finance",
              "Healthcare",
              "Real Estate",
              "Other",
            ].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
              Base Amount (₹) *
            </label>
            <input
              type="number"
              name="baseAmount"
              value={formData.baseAmount}
              onChange={handleChange}
              required
              min="0"
              className="w-full h-[34px] px-3 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
              Tax (%)
            </label>
            <input
              type="number"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              min="0"
              className="w-full h-[34px] px-3 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="2"
            className="w-full p-2.5 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {/* Dynamic Industry Fields */}
        <div className="md:col-span-2 border-t border-gray-100 pt-3 mt-1">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
            {formData.industryType} Specific Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getIndustryFields().map((field) => (
              <div key={field}>
                <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
                  {field}
                </label>
                <input
                  type="text"
                  value={formData.customFields[field] || ""}
                  onChange={(e) =>
                    handleCustomFieldChange(field, e.target.value)
                  }
                  className="w-full h-[34px] px-3 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-[var(--primary)] rounded border-gray-300 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <label
            htmlFor="isActive"
            className="text-[11px] font-medium text-gray-700 cursor-pointer select-none"
          >
            Active Service
          </label>
        </div>
      </div>

      <div className="flex justify-end items-center gap-2.5 border-t border-gray-100 pt-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="em-btn-clear h-[34px] px-5 text-[11px] font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="em-add h-[34px] px-6 text-[11px] font-medium disabled:opacity-40"
        >
          {loading ? "Saving..." : "Save Service"}
        </button>
      </div>
    </form>
  );
};

const Services = () => {
  const { selectedOrganization } = useAuth();
  const [services, setServices] = useState([]);
  const [view, setView] = useState("list");
  const [currentService, setCurrentService] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchServices = async () => {
    try {
      const response = await serviceService.getServices();
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      showSnackbar("Failed to fetch services", "error");
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedOrganization]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = () => {
    setCurrentService(null);
    setView("create");
  };

  const handleEdit = (service) => {
    setCurrentService(service);
    setView("edit");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await serviceService.deleteService(id);
        showSnackbar("Service deleted successfully", "success");
        fetchServices();
      } catch (error) {
        console.error(error);
        showSnackbar("Failed to delete service", "error");
      }
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (currentService) {
        await serviceService.updateService(currentService._id, data);
        showSnackbar("Service updated successfully");
      } else {
        const payload = { ...data };
        if (selectedOrganization) {
          payload.organization = selectedOrganization;
        }
        await serviceService.createService(payload);
        showSnackbar("Service created successfully");
      }
      setView("list");
      fetchServices();
    } catch (error) {
      console.error(error);
      showSnackbar("Operation failed", "error");
    }
  };

  const columns = [
    {
      id: "serviceName",
      label: "Service Name",
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900 text-[11px]">
            {row.serviceName}
          </div>
          <div className="text-[10px] font-mono text-gray-400">
            {row.serviceCode}
          </div>
        </div>
      ),
    },
    {
      id: "industryType",
      label: "Industry",
      render: (row) => (
        <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[9.5px] font-semibold whitespace-nowrap">
          {row.industryType}
        </span>
      ),
    },
    {
      id: "organization",
      label: "Organization",
      render: (row) => (
        <span className="text-[10.5px] text-gray-600">
          {row.organization?.name || "-"}
        </span>
      ),
    },
    {
      id: "baseAmount",
      label: "Base Amount",
      render: (row) => (
        <span className="font-semibold text-gray-900 text-[11px]">
          ₹{parseInt(row.baseAmount).toLocaleString()}
        </span>
      ),
    },
    {
      id: "taxPercentage",
      label: "Tax",
      render: (row) => (
        <span className="text-[10.5px] text-gray-600">
          {row.taxPercentage ? `${row.taxPercentage}%` : "-"}
        </span>
      ),
    },
    {
      id: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[9.5px] font-semibold border ${
            row.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
          />
        </svg>
      ),
      label: "Edit",
      onClick: handleEdit,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
      ),
      label: "Delete",
      onClick: (row) => handleDelete(row._id),
    },
  ];

  const renderCard = (service, actions) => (
    <div className="bg-white rounded-[16px] border border-gray-100 hover:border-gray-200 transition-all flex flex-col p-4">
      {/* Card Header */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="min-w-0">
          <h3
            className="text-[12px] font-semibold text-gray-900 truncate"
            title={service.serviceName}
          >
            {service.serviceName}
          </h3>
          <p className="text-[10px] font-mono text-gray-400 mt-0.5">
            {service.serviceCode}
          </p>
        </div>
        <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[9px] font-semibold whitespace-nowrap shrink-0">
          {service.industryType}
        </span>
      </div>

      {/* Card Body */}
      <div className="flex-grow my-2">
        <div className="mb-2">
          <span className="text-[13px] font-bold text-gray-900">
            ₹{parseInt(service.baseAmount).toLocaleString()}
          </span>
          <span className="text-gray-400 text-[10px] ml-1">+ Tax</span>
        </div>

        {service.description && (
          <p className="text-gray-600 text-[10.5px] line-clamp-2 mb-2">
            {service.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-auto">
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${
              service.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}
          >
            {service.isActive ? "Active" : "Inactive"}
          </span>
          {service.taxPercentage > 0 && (
            <span className="text-[9px] px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-full font-medium">
              Tax: {service.taxPercentage}%
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="border-t border-gray-100 pt-2.5 flex justify-end gap-1.5">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => action.onClick(service)}
            className="em-icon-btn"
            title={action.label}
          >
            {action.icon}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 mb-2 px-1">
        <div>
          <h1 className="text-[13px] font-semibold text-gray-900 tracking-tight">
            Services Management
          </h1>
          <p className="text-[10.5px] text-gray-400 mt-0.5">
            Configure industry-specific product packages, service tiers, and pricing.
          </p>
        </div>
        {view === "list" ? (
          <button
            onClick={handleCreate}
            className="em-add h-[34px] px-4 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Service</span>
          </button>
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

      {view === "list" ? (
        <AdvancedTable
          data={services}
          columns={columns}
          actions={actions}
          renderCard={renderCard}
          emptyMessage="No services found. Create your first service to get started."
          pagination={{ enabled: true, pageSize: 12 }}
        />
      ) : (
        <div className="max-w-3xl mx-auto w-full">
          <ServiceForm
            initialData={currentService}
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

export default Services;
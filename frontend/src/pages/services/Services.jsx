import React, { useState, useEffect } from "react";
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
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <h2 className="text-xl font-bold mb-6">
        {initialData ? "Edit service" : "Create new service"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service name *
          </label>
          <input
            type="text"
            name="serviceName"
            value={formData.serviceName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service code *
          </label>
          <input
            type="text"
            name="serviceCode"
            value={formData.serviceCode}
            onChange={handleChange}
            required
            placeholder="e.g. SRV-001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black uppercase"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry type *
          </label>
          <select
            name="industryType"
            value={formData.industryType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base amount *
            </label>
            <input
              type="number"
              name="baseAmount"
              value={formData.baseAmount}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax (%)
            </label>
            <input
              type="number"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
          ></textarea>
        </div>

        {/* Dynamic Industry Fields */}
        <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
            {formData.industryType} Specific details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getIndustryFields().map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field}
                </label>
                <input
                  type="text"
                  value={formData.customFields[field] || ""}
                  onChange={(e) =>
                    handleCustomFieldChange(field, e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                />
              </div>
            ))}
            {/* Allow adding more? Keeping it simple for now based on requirements */}
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-gray-700"
          >
            Active service
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save service"}
        </button>
      </div>
    </form>
  );
};

const Services = () => {
  const [services, setServices] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list, create, edit
  const [currentService, setCurrentService] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchServices = async () => {
    // setLoading(true); // Global loader used
    try {
      const response = await serviceService.getServices();
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      showSnackbar("Failed to fetch services", "error");
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

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
        await serviceService.createService(data);
        showSnackbar("Service created successfully");
      }
      setView("list");
      fetchServices();
    } catch (error) {
      const msg = error.response?.data?.message || "Operation failed";
      showSnackbar(msg, "error");
    }
  };

  const columns = [
    {
      id: "serviceName",
      label: "Service name",
      render: (row) => (
        <div>
          <div className="font-bold text-gray-900 uppercase">
            {row.serviceName}
          </div>
          <div className="text-xs font-mono text-gray-500">
            {row.serviceCode}
          </div>
        </div>
      ),
    },
    {
      id: "industryType",
      label: "Industry",
      render: (row) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold whitespace-nowrap">
          {row.industryType}
        </span>
      ),
    },
    {
      id: "baseAmount",
      label: "Base amount",
      render: (row) => (
        <span className="font-medium">
          ₹{parseInt(row.baseAmount).toLocaleString()}
        </span>
      ),
    },
    {
      id: "taxPercentage",
      label: "Tax",
      render: (row) => (row.taxPercentage ? `${row.taxPercentage}%` : "-"),
    },
    {
      id: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${row.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
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
          className="w-4 h-4"
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
          className="w-4 h-4"
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
      color: "text-red-500 hover:bg-red-50",
    },
  ];

  const renderCard = (service, actions) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3
            className="text-lg font-bold text-gray-900 uppercase truncate pr-2"
            title={service.serviceName}
          >
            {service.serviceName}
          </h3>
          <p className="text-xs font-mono text-gray-500 mt-1">
            {service.serviceCode}
          </p>
        </div>
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold whitespace-nowrap">
          {service.industryType}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-grow">
        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900">
            ₹{parseInt(service.baseAmount).toLocaleString()}
          </span>
          <span className="text-gray-400 text-sm ml-1">+ Tax</span>
        </div>

        {service.description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {service.description}
          </p>
        )}

        {/* Tags or Extra Info */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${service.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
          >
            {service.isActive ? "Active" : "Inactive"}
          </span>
          {service.taxPercentage > 0 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              Tax: {service.taxPercentage}%
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => action.onClick(service)}
            className={`text-sm font-medium flex items-center gap-1 ${action.color || "text-gray-600 hover:text-black"}`}
          >
            {action.icon}
            {/* For cards, maybe we want text labels too? Existing design had text. Let's keep icons + text or just text as per existing design? 
                       Existing used text buttons "Edit" "Delete". 
                       The actions array uses icons. I'll stick to rendering the action label for consistency with previous card design if preferred, 
                       but mapping generic actions is better for reusability. 
                       Let's make it look like the previous card footer buttons. 
                     */}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Services management
        </h1>
        {view === "list" && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            + Add service
          </button>
        )}
      </div>

      {view === "list" ? (
        <AdvancedTable
          data={services}
          columns={columns}
          actions={actions}
          renderCard={renderCard}
          // loading={loading}
          emptyMessage="No services found. Create your first service to get started."
          pagination={{ enabled: true, rowsPerPage: 12 }} // 12 fits grid nicely
        />
      ) : (
        <div className="max-w-3xl mx-auto">
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

import React, { useState, useEffect } from "react";
import serviceService from "../../services/serviceService";
import Toast from "../../components/common/utils/Toast";

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
        {initialData ? "Edit Service" : "Create New Service"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Name *
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
            Service Code *
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
            Industry Type *
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
              Base Amount *
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
            {formData.industryType} Specific Details
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
            Active Service
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
          {loading ? "Saving..." : "Save Service"}
        </button>
      </div>
    </form>
  );
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list, create, edit
  const [currentService, setCurrentService] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await serviceService.getServices();
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      showSnackbar("Failed to fetch services", "error");
    } finally {
      setLoading(false);
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

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Services Management
        </h1>
        {view === "list" && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            + Add Service
          </button>
        )}
      </div>

      {view === "list" ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No services found. create one!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Service Name</th>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Industry</th>
                    <th className="px-6 py-3">Base Price</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {service.serviceName}
                      </td>
                      <td className="px-6 py-3 font-mono text-gray-500">
                        {service.serviceCode}
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                          {service.industryType}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium">
                        ₹{service.baseAmount}
                      </td>
                      <td className="px-6 py-3">
                        {service.isActive ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>{" "}
                            Active
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>{" "}
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-gray-600 hover:text-black hover:bg-gray-100 p-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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

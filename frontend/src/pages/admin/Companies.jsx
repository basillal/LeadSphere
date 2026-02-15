import React, { useState, useEffect } from "react";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";
import companyService from "../../services/companyService";
import BasicModal from "../../components/common/modals/BasicModal";
import SectionHeader from "../../components/common/sections/SectionHeader";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    plan: "Free",
    ownerName: "",
    ownerEmail: "",
    isActive: true,
  });

  // Delete/Captcha State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const fetchCompanies = async () => {
    // setLoading(true);
    try {
      const response = await companyService.getCompanies();
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreate = () => {
    setCurrentCompany(null);
    setFormData({
      name: "",
      plan: "Free",
      ownerName: "",
      ownerEmail: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (company) => {
    setCurrentCompany(company);
    setFormData({
      name: company.name,
      plan: company.plan,
      ownerName: company.owner?.name || "",
      ownerEmail: company.owner?.email || "",
      isActive: company.isActive,
      logo: company.settings?.logo || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare payload to match backend schema (logo is in settings)
      const payload = {
        ...formData,
        settings: {
          ...(currentCompany?.settings || {}),
          logo: formData.logo,
        },
      };

      if (currentCompany) {
        await companyService.updateCompany(currentCompany._id, payload);
      } else {
        await companyService.createCompany(payload);
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Failed to save company. " + (error.response?.data?.message || ""));
    }
  };

  const handleStatusToggle = async (company) => {
    try {
      const newStatus = !company.isActive;
      await companyService.updateCompany(company._id, { isActive: newStatus });
      fetchCompanies();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleDeleteClick = (company) => {
    setCompanyToDelete(company);
    setCaptchaCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    setCaptchaInput("");
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;
    if (captchaInput !== captchaCode) return;

    try {
      await companyService.deleteCompany(companyToDelete._id);
      setDeleteModalOpen(false);
      setCompanyToDelete(null);
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      alert("Failed to delete company.");
    }
  };

  const columns = [
    {
      id: "name",
      label: "Company name",
      render: (row) => <span className="uppercase">{row.name}</span>,
    },
    { id: "plan", label: "Plan" },
    {
      id: "owner",
      label: "Owner",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 uppercase">
            {row.owner?.name || "-"}
          </div>
          <div className="text-xs text-gray-500">{row.owner?.email || "-"}</div>
        </div>
      ),
    },
    {
      id: "status",
      label: "Status",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusToggle(row);
          }}
          className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer select-none transition-colors ${row.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
          title="Click to toggle status"
        >
          {row.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
  ];

  const actions = [
    {
      label: "Edit",
      onClick: handleEdit,
      color: "text-indigo-600 hover:bg-indigo-100",
      icon: (
        <svg
          className="w-4 h-4"
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
      ),
    },
    {
      label: "Delete",
      onClick: handleDeleteClick,
      color: "text-red-600 hover:bg-red-100",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <SectionHeader
        title="Company Management"
        subtitle="Manage organizations and their owners"
        actionButton={{ label: "Create Company", onClick: handleCreate }}
      />

      <AdvancedTable
        data={companies}
        columns={columns}
        actions={actions}
        // isLoading={loading}
        emptyMessage="No companies found."
        getRowId={(row) => row._id}
        pagination={{ enabled: false }} // Simple list for now
      />

      {/* Create/Edit Modal */}
      <BasicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCompany ? "Edit Company" : "Create New Company"}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company name *
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plan
                </label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                  value={formData.plan}
                  onChange={(e) =>
                    setFormData({ ...formData, plan: e.target.value })
                  }
                >
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                  value={formData.isActive}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows="3"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logo (URL)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.logo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">
                Contact & Address
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Company email
                  </label>
                  <input
                    type="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                  value={formData.website || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Street address
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                  value={formData.address?.street || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    value={formData.address?.city || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    value={formData.address?.state || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Zip code
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    value={formData.address?.zipCode || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          zipCode: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    value={formData.address?.country || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          country: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {!currentCompany && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Owner Account
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Owner name *
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Owner email *
                  </label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={formData.ownerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerEmail: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
            >
              Save
            </button>
          </div>
        </form>
      </BasicModal>

      {/* Delete Confirmation Modal */}
      <BasicModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Company Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            <p className="text-sm font-medium">
              Warning: This action is irreversible!
            </p>
            <p className="text-xs mt-1">
              Deleting <strong>{companyToDelete?.name}</strong> will remove all
              associated Users, Leads, Contacts, Activities, Services, Billing,
              Expenses, and settings.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To confirm, type the code below:
            </label>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 font-mono font-bold tracking-widest rounded border select-none">
                {captchaCode}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCaptchaCode(
                    Math.random().toString(36).substring(2, 8).toUpperCase(),
                  )
                }
                className="text-xs text-blue-600 hover:underline"
              >
                Refresh Code
              </button>
            </div>
            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Enter code"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 uppercase"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={captchaInput !== captchaCode}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                      ${captchaInput === captchaCode ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"}`}
            >
              Delete Company
            </button>
          </div>
        </div>
      </BasicModal>
    </div>
  );
};

export default Companies;

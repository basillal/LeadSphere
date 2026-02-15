import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import companyService from "../../services/companyService";
import { useLoading } from "../../context/LoadingProvider";
import Toast from "../../components/common/utils/Toast";
import Input from "../../components/common/fields/Input";
import TextArea from "../../components/common/fields/TextArea";
import BusinessIcon from "@mui/icons-material/Business";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

const CompanyProfile = () => {
  const { user } = useAuth();
  const { loading } = useLoading();
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    settings: {
      logo: "",
    },
    plan: "",
    isActive: true,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchCompanyData();
  }, [user]);

  const fetchCompanyData = async () => {
    if (user?.company?._id) {
      try {
        const response = await companyService.getCompany(user.company._id);
        const company = response.data;
        setFormData({
          name: company.name || "",
          email: company.email || "",
          phone: company.phone || "",
          website: company.website || "",
          description: company.description || "",
          address: {
            street: company.address?.street || "",
            city: company.address?.city || "",
            state: company.address?.state || "",
            zipCode: company.address?.zipCode || "",
            country: company.address?.country || "",
          },
          settings: {
            logo: company.settings?.logo || "",
          },
          plan: company.plan || "Free",
          isActive: company.isActive,
        });
      } catch (error) {
        console.error("Error fetching company profile:", error);
        setSnackbar({
          open: true,
          message: "Failed to load company profile.",
          severity: "error",
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await companyService.updateCompany(user.company._id, formData);
      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message:
          "Failed to update profile. " + (error.response?.data?.message || ""),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchCompanyData();
  };

  if (loading && !formData.name) {
    return <div className="h-full bg-gray-50" />;
  }

  const ViewFieldSmall = ({ label, value }) => (
    <div className="mb-2">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 leading-none">
        {label}
      </div>
      <div className="text-sm font-medium text-gray-900 truncate min-h-[1.25rem]">
        {value || "-"}
      </div>
    </div>
  );

  const SectionTitle = ({ children }) => (
    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">
      {children}
    </h3>
  );

  return (
    <div className="md:h-[calc(100vh-4rem)] h-auto p-4 bg-gray-50 flex flex-col md:overflow-hidden overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col md:h-full h-auto md:overflow-hidden overflow-visible">
        {/* Header */}
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 bg-gray-50/50">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="h-12 w-12 md:h-10 md:w-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center p-1.5 shadow-sm shrink-0">
              {formData.settings.logo ? (
                <img
                  src={formData.settings.logo}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <BusinessIcon className="text-gray-300" fontSize="small" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">
                {formData.name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border ${formData.isActive ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"}`}
                >
                  {formData.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border text-purple-700 bg-purple-50 border-purple-200">
                  {formData.plan} Plan
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 md:flex-none justify-center md:justify-start flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-xs shadow-sm"
              >
                <EditIcon fontSize="small" className="text-sm" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 md:flex-none justify-center md:justify-start flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-xs"
                >
                  <CloseIcon fontSize="small" className="text-sm" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 md:flex-none justify-center md:justify-start flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all shadow-md font-medium text-xs"
                >
                  <SaveIcon fontSize="small" className="text-sm" />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content - 3 Column Grid that fills remaining height */}
        <div className="p-6 md:overflow-hidden overflow-visible grow">
          <form onSubmit={handleSubmit} className="md:h-full h-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:h-full h-auto">
              {/* Column 1: Essentials */}
              <div className="flex flex-col md:h-full h-auto md:overflow-hidden overflow-visible">
                <SectionTitle>Essentials</SectionTitle>
                <div className="space-y-3 md:overflow-y-auto overflow-visible pr-2 pb-2">
                  {isEditing ? (
                    <>
                      <Input
                        label="Company Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        label="Website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://..."
                      />
                      <Input
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                      />
                      <Input
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </>
                  ) : (
                    <>
                      <ViewFieldSmall
                        label="Company Name"
                        value={formData.name}
                      />
                      <ViewFieldSmall
                        label="Website"
                        value={formData.website}
                      />
                      <ViewFieldSmall label="Email" value={formData.email} />
                      <ViewFieldSmall label="Phone" value={formData.phone} />
                    </>
                  )}
                </div>
              </div>

              {/* Column 2: Location */}
              <div className="flex flex-col md:h-full h-auto md:overflow-hidden overflow-visible">
                <SectionTitle>Location</SectionTitle>
                <div className="space-y-3 md:overflow-y-auto overflow-visible pr-2 pb-2">
                  {isEditing ? (
                    <>
                      <Input
                        label="Street Address"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="City"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                        />
                        <Input
                          label="State"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Zip Code"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleChange}
                        />
                        <Input
                          label="Country"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <ViewFieldSmall
                        label="Street Address"
                        value={formData.address.street}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ViewFieldSmall
                          label="City"
                          value={formData.address.city}
                        />
                        <ViewFieldSmall
                          label="State"
                          value={formData.address.state}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ViewFieldSmall
                          label="Zip Code"
                          value={formData.address.zipCode}
                        />
                        <ViewFieldSmall
                          label="Country"
                          value={formData.address.country}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Column 3: Identity & Details */}
              <div className="flex flex-col md:h-full h-auto md:overflow-hidden overflow-visible">
                <SectionTitle>Identity</SectionTitle>
                <div className="space-y-3 md:overflow-y-auto overflow-visible pr-2 pb-2">
                  {isEditing ? (
                    <>
                      <Input
                        label="Logo URL"
                        name="settings.logo"
                        value={formData.settings.logo}
                        onChange={handleChange}
                        placeholder="https://..."
                      />
                      <TextArea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                      />
                    </>
                  ) : (
                    <>
                      <ViewFieldSmall
                        label="Logo URL"
                        value={formData.settings.logo}
                      />
                      <div className="mt-2">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-none">
                          Description
                        </div>
                        <div className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-100 rounded-lg p-3 whitespace-pre-wrap min-h-[6rem]">
                          {formData.description || "No description provided."}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </div>
  );
};

export default CompanyProfile;

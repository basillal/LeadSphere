import React, { useState, useEffect } from "react";
import Input from "../../components/common/fields/Input";
import Select from "../../components/common/fields/Select";
import SectionHeader from "../../components/common/sections/SectionHeader";

const UserForm = ({ initialData, roles, organizations = [], isSuperAdmin, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    organizationId: "",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        password: "", // Assume we don't show password
        roleId: initialData.role?._id || "",
        organizationId: initialData.organization?._id || initialData.organization || "",
        isActive: initialData.isActive,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Build role options for Select component
  const roleOptions = roles.map((r) => ({
    label: r.roleName || "Unnamed Role",
    value: r._id,
  }));

  // Build organization options for Select component (Super Admin only)
  const orgOptions = [
    { label: "Select Organization", value: "" },
    ...organizations.map((org) => ({
      label: org.name || "Unnamed Organization",
      value: org._id,
    }))
  ];

  return (
    <div className="mx-auto bg-white p-4 md:p-6 rounded-[20px] border border-gray-100">
      <form onSubmit={handleSubmit}>
        <SectionHeader
          title="User Details"
          subtitle="Manage user information and access"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="md:col-span-1"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="md:col-span-1"
          />

          <Input
            label={initialData ? "Password (Leave blank to keep)" : "Password"}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required={!initialData}
            className="md:col-span-1"
          />

          <Select
            label="Role"
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            options={roleOptions}
            required
            className="md:col-span-1"
          />

          {isSuperAdmin && (
            <Select
              label="Organization"
              name="organizationId"
              value={formData.organizationId}
              onChange={handleChange}
              options={orgOptions}
              required
              className="md:col-span-1"
            />
          )}

          <div className="md:col-span-2 flex items-center space-x-2 py-1">
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
              Is Active
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end items-center gap-2.5 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="em-btn-clear h-[34px] px-5 text-[11px] font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="em-add h-[34px] px-5 text-[11px] font-medium"
          >
            Save User
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;

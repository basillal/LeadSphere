import React, { useState, useEffect } from "react";
import Input from "../../components/common/fields/Input";
import Select from "../../components/common/fields/Select";
import SectionHeader from "../../components/common/sections/SectionHeader";

const UserForm = ({ initialData, roles, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        password: "", // Assume we don't show password
        roleId: initialData.role?._id || "",
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

  return (
    <div className="mx-auto bg-white p-3 md:p-3 pb-20 rounded-lg">
      <form onSubmit={handleSubmit}>
        <SectionHeader
          title="User Details"
          subtitle="Manage user information and access"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="md:col-span-2 flex items-center space-x-2 py-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-5 w-5 text-black rounded border-gray-300 focus:ring-black"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              Is Active
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors shadow-sm"
          >
            Save User
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;

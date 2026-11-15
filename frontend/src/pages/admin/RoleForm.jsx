import React, { useState, useEffect } from "react";
import Input from "../../components/common/fields/Input";
import TextArea from "../../components/common/fields/TextArea";
import SectionHeader from "../../components/common/sections/SectionHeader";

const RoleForm = ({
  initialData,
  groupedPermissions,
  onSubmit,
  onCancel,
  isSuperAdmin,
}) => {
  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
    permissions: [],
    accessibleByOrganizationAdmin: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        roleName: initialData.roleName,
        description: initialData.description || "",
        permissions: initialData.permissions.map((p) => p._id),
        accessibleByOrganizationAdmin: initialData.accessibleByOrganizationAdmin || false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (permissionId) => {
    setFormData((prev) => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleResourceToggle = (permissionIds) => {
    setFormData((prev) => {
      const allSelected = permissionIds.every((id) =>
        prev.permissions.includes(id),
      );
      let newPermissions = [...prev.permissions];

      if (allSelected) {
        newPermissions = newPermissions.filter(
          (id) => !permissionIds.includes(id),
        );
      } else {
        permissionIds.forEach((id) => {
          if (!newPermissions.includes(id)) newPermissions.push(id);
        });
      }
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="mx-auto bg-white p-4 md:p-6 rounded-[20px] border border-gray-100">
      <form onSubmit={handleSubmit}>
        <SectionHeader
          title="Role Details"
          subtitle="Define role name and access permissions"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
          <Input
            label="Role Name"
            name="roleName"
            value={formData.roleName}
            onChange={handleChange}
            required
            disabled={initialData?.isSystemRole}
            className="md:col-span-1"
          />
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={1}
            className="md:col-span-1"
          />
        </div>

        {isSuperAdmin && (
          <div className="flex items-center space-x-2 mb-5 py-1">
            <input
              type="checkbox"
              id="accessibleByOrganizationAdmin"
              name="accessibleByOrganizationAdmin"
              checked={formData.accessibleByOrganizationAdmin || false}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  accessibleByOrganizationAdmin: e.target.checked,
                }))
              }
              className="h-4 w-4 text-[var(--primary)] rounded border-gray-300 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label
              htmlFor="accessibleByOrganizationAdmin"
              className="text-[11px] font-medium text-gray-700 cursor-pointer select-none"
            >
              Allow Organization Admins to access this role (System/Global Roles)
            </label>
          </div>
        )}

        <SectionHeader
          title="Permissions"
          subtitle="Select access levels for this role"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {Object.keys(groupedPermissions)
            .filter((key) => isSuperAdmin || key !== "AUDITLOG")
            .map((resource) => {
              const resourcePermissions = groupedPermissions[resource];
              const permissionIds = resourcePermissions.map((p) => p._id);
              const allSelected = permissionIds.every((id) =>
                formData.permissions.includes(id),
              );

              return (
                <div
                  key={resource}
                  className="border border-gray-100 rounded-[16px] p-3.5 bg-gray-50/70"
                >
                  <div className="flex justify-between items-center mb-2.5 border-b border-gray-200/60 pb-2">
                    <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">{resource}</h3>
                    <button
                      type="button"
                      onClick={() => handleResourceToggle(permissionIds)}
                      className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        allSelected
                          ? "bg-[var(--primary)] text-white shadow-sm"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {allSelected ? "Unselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {resourcePermissions.map((perm) => (
                      <div
                        key={perm._id}
                        className="flex items-start space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={perm._id}
                          checked={formData.permissions.includes(perm._id)}
                          onChange={() => handlePermissionChange(perm._id)}
                          className="mt-0.5 h-3.5 w-3.5 text-[var(--primary)] rounded border-gray-300 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <label
                          htmlFor={perm._id}
                          className="text-[10.5px] text-gray-700 cursor-pointer select-none leading-tight"
                        >
                          <span className="font-semibold text-gray-900 block">
                            {perm.permissionName}
                          </span>
                          <span className="text-gray-400 text-[9.5px]">
                            {perm.description}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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
            Save Role
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
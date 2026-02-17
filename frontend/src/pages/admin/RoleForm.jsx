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
    <div className="mx-auto bg-white p-3 md:p-3 pb-20 rounded-lg">
      <form onSubmit={handleSubmit}>
        <SectionHeader
          title="Role Details"
          subtitle="Define role name and access permissions"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          <div className="flex items-center space-x-2 mb-6">
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
              className="h-4 w-4 text-black rounded border-gray-300 focus:ring-black"
            />
            <label
              htmlFor="accessibleByOrganizationAdmin"
              className="text-sm text-gray-700"
            >
              Allow Organization Admins to access this role (System/Global Roles)
            </label>
          </div>
        )}

        <SectionHeader
          title="Permissions"
          subtitle="Select access levels for this role"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                    <h3 className="font-semibold text-gray-900">{resource}</h3>
                    <button
                      type="button"
                      onClick={() => handleResourceToggle(permissionIds)}
                      className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                        allSelected
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {allSelected ? "Unselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="space-y-2">
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
                          className="mt-1 h-4 w-4 text-black rounded border-gray-300 focus:ring-black"
                        />
                        <label
                          htmlFor={perm._id}
                          className="text-sm text-gray-700 cursor-pointer select-none"
                        >
                          <span className="font-medium text-gray-900 block">
                            {perm.permissionName}
                          </span>
                          <span className="text-gray-500 text-xs">
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
            Save Role
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;

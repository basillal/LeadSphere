import { useState, useEffect } from "react";
import roleService from "../../services/roleService";
import RolesTable from "./RolesTable";
import RoleForm from "./RoleForm";
import Toast from "../../components/common/utils/Toast";

import RoleStats from "./RoleStats";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState({ total: 0, system: 0, custom: 0 });
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list', 'create', 'edit'
  const [currentRole, setCurrentRole] = useState(null);
  const [filters, setFilters] = useState({ search: "" });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        roleService.getRoles(),
        roleService.getGroupedPermissions(),
      ]);
      setRoles(rolesData);
      setGroupedPermissions(permissionsData);

      // Calculate Stats
      setStats({
        total: rolesData.length,
        system: rolesData.filter((r) => r.isSystemRole).length,
        custom: rolesData.filter((r) => !r.isSystemRole).length,
      });
    } catch (err) {
      showSnackbar("Failed to fetch data", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleShowCreate = () => {
    setCurrentRole(null);
    setView("create");
  };

  const handleShowEdit = (role) => {
    setCurrentRole(role);
    setView("edit");
  };

  const handleCancelForm = () => {
    setView("list");
    setCurrentRole(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (currentRole) {
        await roleService.updateRole(currentRole._id, formData);
        showSnackbar("Role updated successfully");
      } else {
        await roleService.createRole(formData);
        showSnackbar("Role created successfully");
      }
      fetchData();
      setView("list");
      setCurrentRole(null);
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await roleService.deleteRole(id);
        showSnackbar("Role deleted successfully");
        fetchData();
      } catch (err) {
        showSnackbar(err.response?.data?.message || "Delete failed", "error");
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Filter roles based on search
  const filteredRoles = roles.filter((role) =>
    (role.roleName || "").toLowerCase().includes(filters.search.toLowerCase()),
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {view === "list"
            ? "Roles"
            : view === "create"
              ? "Create New Role"
              : "Edit Role"}
        </h1>
        {view !== "list" && (
          <button
            onClick={handleCancelForm}
            className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            title="Back to List"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          {view === "list" && (
            <>
              <RoleStats stats={stats} />
              <RolesTable
                rows={filteredRoles}
                onCreate={handleShowCreate}
                onEdit={handleShowEdit}
                onDelete={handleDelete}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </>
          )}
          {(view === "create" || view === "edit") && (
            <div className="max-w-4xl mx-auto">
              <RoleForm
                initialData={currentRole}
                groupedPermissions={groupedPermissions}
                onSubmit={handleSubmit}
                onCancel={handleCancelForm}
              />
            </div>
          )}
        </>
      )}

      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default Roles;

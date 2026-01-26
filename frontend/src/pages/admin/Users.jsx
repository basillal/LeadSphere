import { useState, useEffect } from "react";
import userService from "../../services/userService";
import roleService from "../../services/roleService";
import UsersTable from "./UsersTable";
import UserForm from "./UserForm";
import Toast from "../../components/common/utils/Toast";

import UserStats from "./UserStats";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list', 'create', 'edit'
  const [currentUser, setCurrentUser] = useState(null);
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
      const [usersData, rolesData] = await Promise.all([
        userService.getUsers(),
        roleService.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);

      // Calculate Stats
      setStats({
        total: usersData.length,
        active: usersData.filter((u) => u.isActive).length,
        inactive: usersData.filter((u) => !u.isActive).length,
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
    setCurrentUser(null);
    setView("create");
  };

  const handleShowEdit = (user) => {
    setCurrentUser(user);
    setView("edit");
  };

  const handleCancelForm = () => {
    setView("list");
    setCurrentUser(null);
  };

  const handleSubmit = async (formData) => {
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.password) delete dataToSend.password;

      if (currentUser) {
        await userService.updateUser(currentUser._id, dataToSend);
        showSnackbar("User updated successfully");
      } else {
        await userService.createUser(dataToSend);
        showSnackbar("User created successfully");
      }
      fetchData();
      setView("list");
      setCurrentUser(null);
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userService.deleteUser(id);
        showSnackbar("User deleted successfully");
        fetchData();
      } catch (err) {
        showSnackbar(err.response?.data?.message || "Delete failed", "error");
      }
    }
  };

  const handleResetPassword = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to reset this user's password to their email?",
      )
    ) {
      try {
        const res = await userService.resetPassword(id);
        showSnackbar(res.message);
      } catch (err) {
        showSnackbar(err.response?.data?.message || "Reset failed", "error");
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase()),
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {view === "list"
            ? "Users"
            : view === "create"
              ? "Create New User"
              : "Edit User"}
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
              <UserStats stats={stats} />
              <UsersTable
                rows={filteredUsers}
                onCreate={handleShowCreate}
                onEdit={handleShowEdit}
                onDelete={handleDelete}
                onResetPassword={handleResetPassword}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </>
          )}
          {(view === "create" || view === "edit") && (
            <div className="max-w-4xl mx-auto">
              <UserForm
                initialData={currentUser}
                roles={roles}
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

export default Users;

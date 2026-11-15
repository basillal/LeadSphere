import React, { useState, useEffect } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import leadCategoryService from "../services/leadCategoryService";
import { useData } from "../context/DataContext";
import Toast from "../components/common/utils/Toast";
import SectionHeader from "../components/common/sections/SectionHeader";
import Input from "../components/common/fields/Input";
import Loader from "../components/common/Loader";

const Settings = () => {
  const { user, selectedOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState("categories");
  const { categories, categoriesLoading: loading, refreshCategories } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  useEffect(() => {
    // Categories are handled by DataContext
  }, [selectedOrganization]);

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ name: "" });
    setIsAdding(true);
  };

  const handleEdit = (category) => {
    setIsAdding(false);
    setEditingId(category._id);
    setFormData({ name: category.name });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await leadCategoryService.updateCategory(editingId, formData);
        showToast("Category updated successfully");
      } else {
        await leadCategoryService.createCategory(formData);
        showToast("Category created successfully");
      }
      setIsAdding(false);
      setEditingId(null);
      refreshCategories();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await leadCategoryService.deleteCategory(id);
        showToast("Category deleted");
        refreshCategories();
      } catch (err) {
        showToast("Failed to delete category", "error");
      }
    }
  };

  const tabs = [
    { id: "categories", label: "Lead Categories", icon: "🏷️" },
    { id: "profile", label: "Profile Settings", icon: "👤" },
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="px-1 mb-1">
        <h1 className="text-[13px] font-semibold text-gray-900 tracking-tight">
          System Settings
        </h1>
        <p className="text-[10.5px] text-gray-400 mt-0.5">
          Manage system configurations, taxonomy classifications, and profile preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="flex md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full text-[11px] font-medium transition-all whitespace-nowrap w-full text-left ${
                  activeTab === tab.id
                    ? "bg-[#FFF1EB] text-[var(--primary)] font-semibold border border-[#FFD8C7] shadow-sm"
                    : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="text-[12px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 w-full">
          <div className="em-card p-5 bg-white rounded-[24px] border border-gray-100">
            {activeTab === "categories" && (
              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-[13px] font-semibold text-gray-900">Lead Categories</h2>
                    <p className="text-[10.5px] text-gray-400">Classify incoming leads across target business segments.</p>
                  </div>
                  {!isAdding && (
                    <button
                      onClick={handleAdd}
                      className="em-add h-[34px] px-3.5 inline-flex items-center gap-1.5 text-[11px]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Category</span>
                    </button>
                  )}
                </div>

                {isAdding && (
                  <div className="mb-4 p-3.5 bg-gray-50/70 rounded-[16px] border border-dashed border-gray-200">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-2.5">
                      <div className="flex-1 w-full">
                        <Input
                          label="New Category Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Enterprise, Healthcare, Retail..."
                          required
                          autoFocus
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          className="em-add h-[34px] px-4 text-[11px] font-medium"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="em-btn-clear h-[34px] px-4 text-[11px] font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {loading ? (
                  <div className="py-10 flex justify-center relative min-h-[160px] w-full">
                    <Loader local />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {categories.length === 0 && !isAdding ? (
                      <div className="col-span-full py-10 text-center text-gray-400 border border-dashed border-gray-200 rounded-[16px] text-[11px]">
                        No categories found. Create your first category to get started.
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <div
                          key={cat._id}
                          className={`group p-3 bg-white rounded-[14px] border transition-all ${
                            editingId === cat._id
                              ? "border-[var(--primary)] shadow-sm"
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          {editingId === cat._id ? (
                            <form onSubmit={handleSubmit} className="space-y-2">
                              <input
                                className="w-full h-[32px] px-2.5 text-[11px] font-medium border border-gray-200 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-gray-900"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                autoFocus
                                required
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="submit"
                                  className="em-add h-[28px] px-3 text-[10px]"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancel}
                                  className="em-btn-clear h-[28px] px-2.5 text-[10px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-semibold text-gray-800">
                                {cat.name}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(cat)}
                                  className="em-icon-btn em-icon-edit"
                                  title="Edit"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(cat._id)}
                                  className="em-icon-btn em-icon-delete"
                                  title="Delete"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <SectionHeader title="Profile Information" subtitle="Your personal LeadSphere account details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="p-3 bg-gray-50/70 rounded-[12px] border border-gray-100">
                    <p className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-[12px] font-semibold text-gray-900">{user?.name || "-"}</p>
                  </div>
                  <div className="p-3 bg-gray-50/70 rounded-[12px] border border-gray-100">
                    <p className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-[12px] font-semibold text-gray-900">{user?.email || "-"}</p>
                  </div>
                  <div className="p-3 bg-gray-50/70 rounded-[12px] border border-gray-100">
                    <p className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Role</p>
                    <span className="inline-block px-2.5 py-0.5 bg-[var(--primary)] text-white text-[10px] font-semibold rounded-full mt-0.5">
                      {user?.role?.roleName || "User"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
};

export default Settings;
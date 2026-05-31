import React, { useState, useEffect } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import leadCategoryService from "../services/leadCategoryService";
import { useData } from "../context/DataContext";
import Toast from "../components/common/utils/Toast";
import SectionHeader from "../components/common/sections/SectionHeader";
import Input from "../components/common/fields/Input";

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
    // Categories are now handled by DataContext automatically
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
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-600 mt-1 text-sm md:text-base">Manage your application preferences and configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="md:space-y-1 flex md:flex-col gap-2 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex md:w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm md:text-base font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                    : "text-slate-600 bg-white/80 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {activeTab === "categories" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Lead Categories</h2>
                    <p className="text-sm md:text-base text-slate-600">Classify your leads for better organization.</p>
                  </div>
                  {!isAdding && (
                    <button
                      onClick={handleAdd}
                      className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                      + Add Category
                    </button>
                  )}
                </div>

                {isAdding && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-3">
                      <div className="flex-1 w-full">
                        <Input
                          label="New Category Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Category name"
                          required
                          autoFocus
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-black text-white px-4 py-2 rounded-lg text-base font-light h-10 transition-transform active:scale-95"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-base font-light h-10 hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {loading ? (
                  <div className="py-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.length === 0 && !isAdding ? (
                      <div className="col-span-full py-12 text-center text-black border-2 border-dashed border-gray-100 rounded-xl">
                        No categories found. Create your first one to get started.
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <div
                          key={cat._id}
                          className={`group p-3 bg-white rounded-xl border transition-all duration-200 ${
                            editingId === cat._id ? "border-black shadow-lg ring-1 ring-black" : "border-gray-100 hover:border-gray-300"
                          } relative overflow-hidden`}
                        >
                          {editingId === cat._id ? (
                            <form onSubmit={handleSubmit} className="space-y-3">
                              <input
                                className="w-full p-2 text-base font-light border-b border-gray-200 focus:outline-none focus:border-black"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                autoFocus
                                required
                              />
                              <div className="flex justify-end gap-1">
                                <button type="submit" className="text-base font-light bg-black text-white px-3 py-1 rounded">Save</button>
                                <button type="button" onClick={handleCancel} className="text-base font-light bg-gray-100 px-3 py-1 rounded">Cancel</button>
                              </div>

                            </form>
                          ) : (
                            <>

                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <span 
                                    className="text-base font-light uppercase tracking-wider text-black"
                                  >
                                    {cat.name}
                                  </span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleEdit(cat)}
                                    className="p-1.5 hover:bg-gray-100 rounded text-black hover:text-black transition-colors"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(cat._id)}
                                    className="p-1.5 hover:bg-red-50 rounded text-black hover:text-red-500 transition-colors"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="p-6">
                <SectionHeader title="Profile Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <p className="text-base font-light text-black uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-base font-light text-black">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-base font-light text-black uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-base font-light text-black">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-base font-light text-black uppercase tracking-wider mb-1">Role</p>
                    <span className="inline-block px-3 py-1 bg-black text-white text-base font-light rounded-full">
                      {user?.role?.roleName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Management Replaced Modal */}

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


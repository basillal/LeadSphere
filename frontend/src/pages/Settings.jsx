import React, { useState, useEffect } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import leadCategoryService from "../services/leadCategoryService";
import Toast from "../components/common/utils/Toast";
import SectionHeader from "../components/common/sections/SectionHeader";
import Input from "../components/common/fields/Input";

const Settings = () => {
  const { user, selectedOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", color: "#3b82f6" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await leadCategoryService.getCategories();
      setCategories(res.data);
    } catch (err) {
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [selectedOrganization]);

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ name: "", color: "#3b82f6" });
    setIsAdding(true);
  };

  const handleEdit = (category) => {
    setIsAdding(false);
    setEditingId(category._id);
    setFormData({ name: category.name, color: category.color });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", color: "#3b82f6" });
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
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await leadCategoryService.deleteCategory(id);
        showToast("Category deleted");
        fetchCategories();
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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your application preferences and configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-black text-white shadow-lg shadow-black/10"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
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
                    <h2 className="text-xl font-bold text-gray-900">Lead Categories</h2>
                    <p className="text-sm text-gray-500">Classify your leads for better organization.</p>
                  </div>
                  {!isAdding && (
                    <button
                      onClick={handleAdd}
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
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
                      <div className="w-full sm:w-24">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Color</label>
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-full h-10 p-1 bg-white border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold h-10 transition-transform active:scale-95"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold h-10 hover:bg-gray-100 transition-colors"
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
                      <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
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
                                className="w-full p-2 text-sm font-bold border-b border-gray-200 focus:outline-none focus:border-black"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                autoFocus
                                required
                              />
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-8 h-8 rounded-lg cursor-pointer border-none p-0"
                                  />
                                  <span className="text-[10px] font-mono uppercase text-gray-400">{formData.color}</span>
                                </div>
                                <div className="flex gap-1">
                                  <button type="submit" className="text-[11px] font-bold bg-black text-white px-3 py-1 rounded">Save</button>
                                  <button type="button" onClick={handleCancel} className="text-[11px] font-bold bg-gray-100 px-3 py-1 rounded">Cancel</button>
                                </div>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div
                                className="absolute top-0 left-0 w-1 h-full"
                                style={{ backgroundColor: cat.color }}
                              ></div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <span 
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-black/10 inline-flex items-center gap-1.5`}
                                    style={{ 
                                      backgroundColor: cat.color,
                                      color: (function(hex) {
                                        if (!hex) return 'white';
                                        const r = parseInt(hex.slice(1, 3), 16);
                                        const g = parseInt(hex.slice(3, 5), 16);
                                        const b = parseInt(hex.slice(5, 7), 16);
                                        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
                                        return yiq >= 128 ? 'black' : 'white';
                                      })(cat.color)
                                    }}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                                    {cat.name}
                                  </span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleEdit(cat)}
                                    className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-black transition-colors"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(cat._id)}
                                    className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
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
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Role</p>
                    <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
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


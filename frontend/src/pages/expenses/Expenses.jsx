import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";
import BasicModal from "../../components/common/modals/BasicModal";
import expenseService from "../../services/expenseService";
import Toast from "../../components/common/utils/Toast";
import TimeRangeFilter, { getDateRange } from "../../components/common/TimeRangeFilter";
import { formatDate } from "../../utils/dateUtils";

const Expenses = () => {
  const { selectedOrganization } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [timeRange, setTimeRange] = useState("last_30_days");

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    expenseDate: new Date().toISOString().split("T")[0],
    description: "",
  });

  const fetchExpenses = async () => {
    try {
      const params = {};
      const range = getDateRange(timeRange);
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;
      
      const response = await expenseService.getExpenses(params);
      setExpenses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      Toast("Failed to fetch expenses", "error");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedOrganization, timeRange]);

  const handleRangeChange = (range) => {
    // Handled by effect
  };

  const handleCreate = () => {
    setCurrentExpense(null);
    setFormData({
      title: "",
      amount: "",
      category: "",
      expenseDate: new Date().toISOString().split("T")[0],
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      expenseDate: new Date(expense.expenseDate).toISOString().split("T")[0],
      description: expense.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await expenseService.deleteExpense(id);
        Toast("Expense deleted successfully", "success");
        fetchExpenses();
      } catch (error) {
        console.error("Error deleting expense:", error);
        Toast("Failed to delete expense", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentExpense) {
        await expenseService.updateExpense(currentExpense._id, formData);
        Toast("Expense updated successfully", "success");
      } else {
        const payload = { ...formData };
        if (selectedOrganization) {
          payload.organization = selectedOrganization;
        }
        await expenseService.createExpense(payload);
        Toast("Expense created successfully", "success");
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
      Toast("Failed to save expense", "error");
    }
  };

  const columns = [
    {
      id: "title",
      label: "Title",
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900 text-[11px]">{row.title}</div>
          {row.description && (
            <div className="text-[10px] text-gray-400 line-clamp-1">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      id: "category",
      label: "Category",
      render: (row) => (
        <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 text-[9.5px] font-semibold rounded-full border border-gray-200">
          {row.category}
        </span>
      ),
    },
    {
      id: "organization",
      label: "Organization",
      render: (row) => (
        <span className="text-[10.5px] text-gray-600">
          {row.organization?.name || "-"}
        </span>
      ),
    },
    {
      id: "expenseDate",
      label: "Date",
      render: (row) => (
        <span className="text-[10.5px] text-gray-700">
          {formatDate(row.expenseDate)}
        </span>
      ),
    },
    {
      id: "amount",
      label: "Amount",
      render: (row) => (
        <span className="font-bold text-rose-600 text-[11px]">
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(row.amount)}
        </span>
      ),
    },
    {
      id: "createdBy",
      label: "Added By",
      render: (row) => (
        <span className="text-[10.5px] text-gray-500">
          {row.createdBy?.name || "-"}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "Edit",
      onClick: handleEdit,
    },
    {
      label: "Delete",
      onClick: (row) => handleDelete(row._id),
    },
  ];

  const totalSpend = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const claimsCount = expenses.length;
  const avgExpense = claimsCount > 0 ? Math.round(totalSpend / claimsCount) : 0;
  const categorySpend = expenses.reduce((acc, curr) => {
    const cat = curr.category || "General";
    acc[cat] = (acc[cat] || 0) + (Number(curr.amount) || 0);
    return acc;
  }, {});
  const topCategory = Object.keys(categorySpend).sort((a, b) => categorySpend[b] - categorySpend[a])[0] || "-";

  return (
    <div className="w-full flex flex-col gap-2 font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2 px-1">
        <div>
          <h1 className="text-[13px] font-semibold text-gray-900 tracking-tight">Expenses</h1>
          <p className="text-[10.5px] text-gray-400 mt-0.5">
            Track operational spending, vendor receipts, and category expenses.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TimeRangeFilter
            value={timeRange}
            onChange={setTimeRange}
            onRangeChange={handleRangeChange}
          />
          <button
            onClick={handleCreate}
            className="em-add h-[34px] px-4 inline-flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Spend Outflow Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div className="bg-white p-3.5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Total Spend Outflow
            </span>
            <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-[11px] font-bold">
              ₹
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[18px] font-bold text-gray-900 leading-tight">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalSpend)}
            </span>
            <span className="text-[9.5px] text-gray-400 font-medium">Logged expenses</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Expense Vouchers
            </span>
            <span className="w-6 h-6 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center text-[11px]">
              🧾
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[18px] font-bold text-gray-900 leading-tight">
              {claimsCount}
            </span>
            <span className="text-[9.5px] text-gray-400 font-medium">Approved claims</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Average Claim
            </span>
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[11px]">
              📊
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[18px] font-bold text-gray-900 leading-tight">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(avgExpense)}
            </span>
            <span className="text-[9.5px] text-gray-400 font-medium">Per voucher avg</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Top Category
            </span>
            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-[11px]">
              🏷️
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] font-bold text-gray-800 leading-tight truncate">
              {topCategory}
            </span>
            <span className="text-[9.5px] text-gray-400 font-medium">Primary driver</span>
          </div>
        </div>
      </div>

      <AdvancedTable
        data={expenses}
        columns={columns}
        actions={actions}
        emptyMessage="No expenses found."
        pagination={{ enabled: true, pageSize: 10 }}
      />

      <BasicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentExpense ? "Edit Expense" : "New Expense"}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              className="w-full h-[34px] px-3 text-[11px] font-medium text-gray-900 bg-white border border-[#D1D5DB] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="e.g. Office supplies, Cloud hosting..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full h-[34px] px-3 text-[11px] font-medium text-gray-900 bg-white border border-[#D1D5DB] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-gray-900"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                className="w-full h-[34px] px-3 text-[11px] font-medium text-gray-900 bg-white border border-[#D1D5DB] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-gray-900"
                value={formData.expenseDate}
                onChange={(e) =>
                  setFormData({ ...formData, expenseDate: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
              Category *
            </label>
            <select
              required
              className="w-full h-[34px] px-3 text-[11px] font-medium text-gray-900 bg-white border border-[#D1D5DB] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-gray-900"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              <option value="Office">Office</option>
              <option value="Travel">Travel</option>
              <option value="Software">Software</option>
              <option value="Marketing">Marketing</option>
              <option value="Salary">Salary</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#4A5565] mb-1">
              Description
            </label>
            <textarea
              className="w-full p-2.5 text-[11px] font-medium text-gray-900 bg-white border border-[#D1D5DB] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-gray-900"
              rows="3"
              placeholder="Additional expense notes..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="em-btn-clear h-[34px] px-4 text-[11px] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="em-add h-[34px] px-5 text-[11px] font-medium"
            >
              Save Expense
            </button>
          </div>
        </form>
      </BasicModal>
    </div>
  );
};

export default Expenses;
import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import AdvancedTable from "../../components/common/advancedTables/AdvancedTable";
import BasicModal from "../../components/common/modals/BasicModal";
import expenseService from "../../services/expenseService";
import Toast from "../../components/common/utils/Toast";

const Expenses = () => {
  const { selectedCompany } = useAuth();
  const [expenses, setExpenses] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    expenseDate: new Date().toISOString().split("T")[0],
    description: "",
  });

  const fetchExpenses = async () => {
    // setLoading(true);
    try {
      const response = await expenseService.getExpenses();
      setExpenses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      Toast("Failed to fetch expenses", "error");
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCompany]);

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
        if (selectedCompany) {
          payload.company = selectedCompany;
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
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      ),
    },
    {
      id: "category",
      label: "Category",
      render: (row) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
          {row.category}
        </span>
      ),
    },
    {
      id: "company",
      label: "Company",
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">
          {row.company?.name || "-"}
        </span>
      ),
    },
    {
      id: "expenseDate",
      label: "Date",
      render: (row) => new Date(row.expenseDate).toLocaleDateString(),
    },
    {
      id: "amount",
      label: "Amount",
      render: (row) => (
        <span className="font-bold text-red-600">
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
      render: (row) => row.createdBy?.name || "-",
    },
  ];

  const actions = [
    {
      label: "Edit",
      onClick: handleEdit,
      color: "text-blue-600 hover:bg-blue-50",
    },
    {
      label: "Delete",
      onClick: (row) => handleDelete(row._id),
      color: "text-red-600 hover:bg-red-50",
    },
  ];

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500">
            Track and manage company expenses
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Expense
        </button>
      </div>

      <AdvancedTable
        data={expenses}
        columns={columns}
        actions={actions}
        // isLoading={loading}
        emptyMessage="No expenses found."
        pagination={{ enabled: true, pageSize: 10 }}
      />

      <BasicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentExpense ? "Edit Expense" : "New Expense"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={formData.expenseDate}
                onChange={(e) =>
                  setFormData({ ...formData, expenseDate: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
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
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
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

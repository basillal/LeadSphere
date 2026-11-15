import React, { useState, useEffect } from "react";
import Input from "../../components/common/fields/Input";
import Select from "../../components/common/fields/Select";
import TextArea from "../../components/common/fields/TextArea";
import LeadAutocomplete from "../../components/common/fields/LeadAutocomplete";
import userService from "../../services/userService";
import { useAuth } from "../../components/auth/AuthProvider";

const FollowUpForm = ({ initialData, lead, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    scheduledAt: "",
    type: "Call",
    status: "Pending",
    notes: "",
    outcome: "",
    lead: lead?._id || "",
    assignedTo: "",
  });
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const resp = await userService.getUsers();
        setUsers(Array.isArray(resp) ? resp : resp.data || []);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    fetchUsers();
  }, []);

  const isAdmin =
    currentUser?.role?.roleName === "Super Admin" ||
    currentUser?.role?.roleName === "Organization Admin";

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        type: initialData.type || "Call",
        status: initialData.status || "Pending",
        scheduledAt: initialData.scheduledAt
          ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
          : "",
        lead: initialData.lead?._id || initialData.lead || "",
      });
    } else if (lead) {
      setFormData((prev) => ({ ...prev, lead: lead._id || lead }));
    }
  }, [initialData, lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeadChange = (val) => {
    setFormData((prev) => ({ ...prev, lead: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      lead: formData.lead?._id || formData.lead,
    };
    onSubmit(payload);
  };

  return (
    <div className="font-inter">
      {lead ? (
        <div className="mb-4 p-3 bg-[#F8FAFC] rounded-[12px] border border-[#E2E8F0]">
          <span className="text-[9.5px] uppercase tracking-[0.08em] font-semibold text-[#8B92A5] block mb-0.5">
            Target Lead
          </span>
          <p className="text-[11px] font-semibold text-[#111827] m-0">
            {lead.name}
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <label className="text-[10px] font-medium text-[#4A5565] mb-1 block">
            Select Lead <span className="text-red-500">*</span>
          </label>
          <LeadAutocomplete
            value={formData.lead}
            onChange={handleLeadChange}
            required
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-[10px] font-medium text-[#4A5565] mb-1 block">
            Date &amp; Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="scheduledAt"
            value={formData.scheduledAt}
            onChange={handleChange}
            required
            className="w-full h-[34px] px-3 text-[11px] font-medium text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-medium text-[#4A5565] mb-1 block">
              Interaction Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full h-[34px] px-3 text-[11px] font-medium text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none"
            >
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Task">Task</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-medium text-[#4A5565] mb-1 block">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full h-[34px] px-3 text-[11px] font-medium text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Missed">Missed</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-medium text-[#4A5565] mb-1 block">
            Notes / Agenda
          </label>
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            rows={3}
            placeholder="Add relevant context, topics to discuss, or instructions..."
            className="w-full p-2.5 text-[11px] text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none min-h-[72px] resize-none"
          />
        </div>

        {formData.status !== "Pending" && (
          <div>
            <label className="text-[10px] font-medium text-[#4A5565] mb-1 block">
              Outcome / Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              name="outcome"
              value={formData.outcome || ""}
              onChange={handleChange}
              rows={2}
              required
              placeholder="What was the result of this follow-up?"
              className="w-full p-2.5 text-[11px] text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none min-h-[64px] resize-none"
            />
          </div>
        )}

        {isAdmin && (
          <div>
            <label className="text-[10px] font-medium text-[#4A5565] mb-1 block">
              Assigned Representative
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo || ""}
              onChange={handleChange}
              className="w-full h-[34px] px-3 text-[11px] font-medium text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none"
            >
              <option value="">Select User</option>
              {users
                .filter((u) => {
                  if (currentUser?.role?.roleName === "Super Admin") return true;
                  const ownerId =
                    currentUser?.organization?.owner?._id ||
                    currentUser?.organization?.owner;
                  return u._id !== ownerId;
                })
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="em-btn-clear"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="em-add"
          >
            {isLoading ? (
              <span>Saving...</span>
            ) : (
              <span>{initialData ? "Save Changes" : "Create Schedule"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FollowUpForm;

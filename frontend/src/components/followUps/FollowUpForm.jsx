import React, { useState, useEffect } from "react";
import Input from "../common/fields/Input";
import Select from "../common/fields/Select";
import TextArea from "../common/fields/TextArea";
import LeadAutocomplete from "../common/fields/LeadAutocomplete";
import leadService from "../../services/leadService";

const FollowUpForm = ({ initialData, lead, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    scheduledAt: "",
    type: "Call",
    status: "Pending",
    notes: "",
    outcome: "",
    lead: lead?._id || "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        scheduledAt: initialData.scheduledAt
          ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
          : "",
        lead: initialData.lead?._id || initialData.lead || "",
      });
    } else if (lead) {
      setFormData((prev) => ({ ...prev, lead: lead._id }));
    }
  }, [initialData, lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeadChange = (leadId) => {
    setFormData((prev) => ({ ...prev, lead: leadId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      {lead ? (
        <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-sm text-gray-500">For Lead</p>
          <p className="font-semibold">{lead.name}</p>
        </div>
      ) : (
        <div className="mb-4">
          <LeadAutocomplete
            value={formData.lead}
            onChange={handleLeadChange}
            required
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Date & Time"
          name="scheduledAt"
          type="datetime-local"
          value={formData.scheduledAt}
          onChange={handleChange}
          required
        />

        <Select
          label="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={["Call", "Email", "Meeting", "WhatsApp", "Task"]}
          required
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={["Pending", "Completed", "Missed", "Rescheduled"]}
          required
        />

        <TextArea
          label="Notes / Agenda"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
        />

        {formData.status !== "Pending" && (
          <TextArea
            label="Outcome / Remarks"
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            rows={2}
          />
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default FollowUpForm;

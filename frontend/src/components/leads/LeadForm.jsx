import React, { useState } from "react";

// Reusable Label Component
const Label = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

// Reusable Input Component
const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  className = "",
  ...props
}) => (
  <div className={className}>
    {label && <Label required={required}>{label}</Label>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      required={required}
      {...props}
    />
  </div>
);

// Reusable Select Component
const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  required,
  className = "",
  ...props
}) => (
  <div className={className}>
    {label && <Label required={required}>{label}</Label>}
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-colors"
        required={required}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {/* Custom Arrow Icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  </div>
);

// Reusable Textarea Component
const TextArea = ({
  label,
  name,
  value,
  onChange,
  rows = 3,
  className = "",
  ...props
}) => (
  <div className={className}>
    {label && <Label>{label}</Label>}
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      {...props}
    />
  </div>
);

// Section Header Component
const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-4 mt-8 border-b border-gray-200 pb-2">
    <h3 className="text-lg font-semibold text-blue-600">{title}</h3>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </div>
);

const LeadForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => {
    const initialState = {
      // 1. Basic Info
      name: "",
      phone: "",
      alternatePhone: "",
      email: "",
      companyName: "",
      designation: "",
      website: "",

      // 2. Lead Source
      source: "Website",
      sourceDetails: "",
      campaignName: "",
      referredBy: "",

      // 3. Status & Priority
      status: "New",
      priority: "Medium",
      leadTemperature: "Warm",
      isActive: true,
      lostReason: "",

      // 4. Follow-Up
      nextFollowUpDate: "",
      followUpMode: "",
      followUpRemarks: "",
      followUpCount: 0,

      // 5. Business Details
      requirement: "",
      budgetRange: "",
      expectedClosureDate: "",
      interestedProduct: "",
      dealValue: "",

      // 6. Communication Preferences
      preferredContactMode: "",
      preferredContactTime: "",
      doNotDisturb: false,

      // 7. Tags & Custom Fields
      tags: [],
      tagsInput: "", // Temporary for input

      // 9. Notes
      notes: "",
      internalComments: "",
    };

    if (initialData) {
      return {
        ...initialState,
        ...initialData,
        nextFollowUpDate: initialData.nextFollowUpDate
          ? initialData.nextFollowUpDate.split("T")[0]
          : "",
        expectedClosureDate: initialData.expectedClosureDate
          ? initialData.expectedClosureDate.split("T")[0]
          : "",
      };
    }

    return initialState;
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTagDelete = (tagToDelete) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToDelete),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && formData.tagsInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(formData.tagsInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, prev.tagsInput.trim()],
          tagsInput: "",
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = { ...formData };
    if (!cleanedData.followUpMode) delete cleanedData.followUpMode;
    if (!cleanedData.preferredContactMode)
      delete cleanedData.preferredContactMode;
    if (!cleanedData.nextFollowUpDate) delete cleanedData.nextFollowUpDate;
    if (!cleanedData.expectedClosureDate)
      delete cleanedData.expectedClosureDate;

    onSubmit(cleanedData);
  };

  return (
    <div className="mx-auto bg-white p-3 md:p-6 pb-20 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* 1. Basic Lead Information */}
        <SectionHeader
          title="1. Basic Lead Information"
          subtitle="Who is the lead?"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="md:col-span-3"
          />
          <Input
            label="Primary Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="md:col-span-3"
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="md:col-span-3"
          />
          <Input
            label="Alternate Phone"
            name="alternatePhone"
            value={formData.alternatePhone}
            onChange={handleChange}
            className="md:col-span-3"
          />

          <Input
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Input
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Input
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="md:col-span-2"
          />
        </div>

        {/* 2. Lead Source Information */}
        <SectionHeader
          title="2. Lead Source Information"
          subtitle="Where did the lead come from?"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Select
            label="Source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            options={[
              "Website",
              "Referral",
              "WhatsApp",
              "Cold Call",
              "Event",
              "Other",
            ]}
            required
            className="md:col-span-2"
          />
          <Input
            label="Source Details"
            name="sourceDetails"
            value={formData.sourceDetails}
            onChange={handleChange}
            className="md:col-span-4"
          />

          <Input
            label="Campaign Name"
            name="campaignName"
            value={formData.campaignName}
            onChange={handleChange}
            className="md:col-span-3"
          />
          <Input
            label="Referred By"
            name="referredBy"
            value={formData.referredBy}
            onChange={handleChange}
            className="md:col-span-3"
          />
        </div>

        {/* 3. Lead Status & Priority */}
        <SectionHeader
          title="3. Lead Status & Priority"
          subtitle="Current state of the lead"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={["New", "Contacted", "Follow-up", "Converted", "Lost"]}
            required
            className="md:col-span-2"
          />
          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={["Low", "Medium", "High"]}
            className="md:col-span-2"
          />
          <Select
            label="Temperature"
            name="leadTemperature"
            value={formData.leadTemperature}
            onChange={handleChange}
            options={["Hot", "Warm", "Cold"]}
            className="md:col-span-2"
          />

          <div className="md:col-span-2 flex items-center space-x-2 py-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              Is Active
            </label>
          </div>

          {formData.status === "Lost" && (
            <div className="md:col-span-6">
              <Input
                label="Lost Reason"
                name="lostReason"
                value={formData.lostReason}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {/* 4. Follow-Up Information */}
        <SectionHeader
          title="4. Follow-Up Information"
          subtitle="What needs to be done next?"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Input
            label="Next Follow-Up Date"
            name="nextFollowUpDate"
            type="datetime-local"
            value={formData.nextFollowUpDate}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Select
            label="Follow-Up Mode"
            name="followUpMode"
            value={formData.followUpMode}
            onChange={handleChange}
            options={["Call", "WhatsApp", "Email", "Meeting", "None"].map(
              (opt) => ({ label: opt, value: opt === "None" ? "" : opt }),
            )}
            className="md:col-span-2"
          />
          <Input
            label="Follow-Up Count"
            name="followUpCount"
            type="number"
            value={formData.followUpCount}
            disabled
            className="md:col-span-2 bg-gray-50"
          />
          <div className="md:col-span-6">
            <TextArea
              label="Follow-Up Remarks"
              name="followUpRemarks"
              value={formData.followUpRemarks}
              onChange={handleChange}
              rows={2}
            />
          </div>
        </div>

        {/* 5. Business Details */}
        <SectionHeader
          title="5. Business Details"
          subtitle="Why are they interested?"
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4">
            <TextArea
              label="Requirement"
              name="requirement"
              value={formData.requirement}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <Input
            label="Interested Product"
            name="interestedProduct"
            value={formData.interestedProduct}
            onChange={handleChange}
          />
          <Input
            label="Budget Estimate"
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
          />
          <Input
            label="Deal Value"
            name="dealValue"
            type="number"
            value={formData.dealValue}
            onChange={handleChange}
          />
          <Input
            label="Expected Closure Date"
            name="expectedClosureDate"
            type="date"
            value={formData.expectedClosureDate}
            onChange={handleChange}
          />
        </div>

        {/* 6. Communication Preferences */}
        <SectionHeader
          title="6. Communication Preferences"
          subtitle="How they want to be contacted"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Select
            label="Preferred Contact Mode"
            name="preferredContactMode"
            value={formData.preferredContactMode}
            onChange={handleChange}
            options={["Call", "WhatsApp", "Email", "None"].map((opt) => ({
              label: opt,
              value: opt === "None" ? "" : opt,
            }))}
            className="md:col-span-3"
          />
          <Input
            label="Preferred Time"
            name="preferredContactTime"
            placeholder="e.g. Morning, After 6PM"
            value={formData.preferredContactTime}
            onChange={handleChange}
            className="md:col-span-3"
          />
          <div className="md:col-span-6 flex items-center space-x-2">
            <input
              type="checkbox"
              id="doNotDisturb"
              name="doNotDisturb"
              checked={formData.doNotDisturb}
              onChange={handleChange}
              className="h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
            />
            <label
              htmlFor="doNotDisturb"
              className="text-sm font-medium text-gray-700"
            >
              Do Not Disturb (DND)
            </label>
          </div>
        </div>

        {/* 7. Tags */}
        <SectionHeader title="7. Tags" subtitle="Flexible classification" />
        <div className="space-y-2">
          <Input
            label="Add Tags (Press Enter)"
            name="tagsInput"
            value={formData.tagsInput}
            onChange={handleChange}
            onKeyDown={handleTagKeyDown}
            placeholder="VIP, Urgent, Hot Lead..."
          />
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagDelete(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 9. Notes & Attachments */}
        <SectionHeader title="9. Notes & Internal Comments" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Public Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
          <TextArea
            label="Internal Private Comments"
            name="internalComments"
            value={formData.internalComments}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {/* Actions */}
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
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            Save Lead
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;

import React, { useState } from "react";
import Label from "../../components/common/fields/Label";
import Input from "../../components/common/fields/Input";
import Select from "../../components/common/fields/Select";
import TextArea from "../../components/common/fields/TextArea";
import ReferrerAutocomplete from "../../components/common/fields/ReferrerAutocomplete";
import SectionHeader from "../../components/common/sections/SectionHeader";

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
      referredBy: null,

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

      attachments: "",

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
        attachments: initialData.attachments
          ? initialData.attachments.join("\n")
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

    // Convert attachments string to array
    if (cleanedData.attachments) {
      cleanedData.attachments = cleanedData.attachments
        .split("\n")
        .filter((url) => url.trim() !== "");
    } else {
      cleanedData.attachments = [];
    }

    onSubmit(cleanedData);
  };

  return (
    <div className="mx-auto bg-white p-3 md:p-3 pb-20 rounded-lg">
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
          <div className="md:col-span-3">
            <ReferrerAutocomplete
              value={formData.referredBy}
              onChange={(newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  referredBy: newValue?._id || null,
                }));
              }}
              className="w-full"
            />
          </div>
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
              className="h-5 w-5 text-black rounded border-gray-300 focus:ring-black"
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
                className="px-3 py-1 bg-gray-200 text-black rounded-full text-sm font-medium flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagDelete(tag)}
                  className="ml-2 text-gray-500 hover:text-black focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 8. Attachments */}
        <SectionHeader
          title="8. Attachments"
          subtitle="Add file URLs (one per line)"
        />
        <div className="space-y-2 mb-6">
          <TextArea
            label="Attachment URLs"
            name="attachments"
            value={formData.attachments}
            onChange={handleChange}
            placeholder="https://example.com/file1.pdf&#10;https://example.com/proposal.docx"
            rows={3}
          />
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
            className="px-6 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors shadow-sm"
          >
            Save Lead
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;

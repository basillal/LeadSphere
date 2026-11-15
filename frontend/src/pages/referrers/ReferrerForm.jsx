import React, { useState } from "react";
import Label from "../../components/common/fields/Label";
import Input from "../../components/common/fields/Input";
import TextArea from "../../components/common/fields/TextArea";
import SectionHeader from "../../components/common/sections/SectionHeader";

const ReferrerForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => {
    const initialState = {
      name: "",
      phone: "",
      email: "",
      alternatePhone: "",
      organizationName: "",
      designation: "",
      notes: "",
      isActive: true,
    };

    if (initialData) {
      return {
        ...initialState,
        ...initialData,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="mx-auto bg-white p-3 md:p-4 rounded-[20px] border border-gray-100">
      <form onSubmit={handleSubmit}>
        {/* 1. Basic Referrer Information */}
        <SectionHeader
          title="1. Basic Referrer Information"
          subtitle="Who is referring leads to you?"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Input
            label="Full name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="md:col-span-3"
          />
          <Input
            label="Primary phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="md:col-span-3"
          />

          <Input
            label="Email address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="md:col-span-3"
          />
          <Input
            label="Alternate phone"
            name="alternatePhone"
            value={formData.alternatePhone}
            onChange={handleChange}
            className="md:col-span-3"
          />

          <Input
            label="Organization name"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            className="md:col-span-3"
          />
          <Input
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className="md:col-span-3"
          />
        </div>

        {/* 2. Notes */}
        <SectionHeader title="2. Notes" subtitle="Additional information" />
        <div className="grid grid-cols-1 gap-4">
          <TextArea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any additional notes about this referrer..."
          />
        </div>

        {/* 3. Status */}
        <SectionHeader title="3. Referrer Status" />
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-[var(--primary)] rounded border-gray-300 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label
              htmlFor="isActive"
              className="text-[11px] font-medium text-gray-700 cursor-pointer select-none"
            >
              Is Active
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end items-center gap-2.5 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="em-btn-clear h-[34px] px-5 text-[11px] font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="em-add h-[34px] px-5 text-[11px] font-medium"
          >
            Save Referrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReferrerForm;

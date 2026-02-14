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
      companyName: "",
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
    <div className="mx-auto bg-white p-3 md:p-3 pb-20 rounded-lg">
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
            label="Company name"
            name="companyName"
            value={formData.companyName}
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
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-2 py-2">
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
              Is active
            </label>
          </div>
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
            Save Referrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReferrerForm;

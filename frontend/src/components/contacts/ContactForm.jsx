import React, { useState } from "react";
import Label from "../../components/common/fields/Label";
import Input from "../../components/common/fields/Input";
import Select from "../../components/common/fields/Select";
import TextArea from "../../components/common/fields/TextArea";
import SectionHeader from "../../components/common/SectionHeader";

const ContactForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => {
    const initialState = {
      // Basic Info
      name: "",
      phone: "",
      alternatePhone: "",
      email: "",
      companyName: "",
      designation: "",
      website: "",

      // Relationship & Tags
      tags: [],
      relationshipType: "Business",

      // Social Profiles
      linkedInProfile: "",
      twitterHandle: "",
      facebookProfile: "",
      birthday: "",
      anniversary: "",

      // Address
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      },

      // Business Info
      industry: "",
      companySize: "Unknown",
      annualRevenue: "",

      // Interaction Tracking
      lastInteractionDate: "",
      lastInteractionType: "",
      nextFollowUpDate: "",

      // Communication Preferences
      preferredContactMode: "Call",
      preferredContactTime: "",
      doNotDisturb: false,
      timezone: "",

      // Notes
      notes: "",
      internalComments: "",

      // Status
      isActive: true,
      status: "Active",
    };

    if (initialData) {
      return {
        ...initialState,
        ...initialData,
        birthday: initialData.birthday
          ? initialData.birthday.split("T")[0]
          : "",
        anniversary: initialData.anniversary
          ? initialData.anniversary.split("T")[0]
          : "",
        lastInteractionDate: initialData.lastInteractionDate
          ? initialData.lastInteractionDate.split("T")[0]
          : "",
        nextFollowUpDate: initialData.nextFollowUpDate
          ? initialData.nextFollowUpDate.split("T")[0]
          : "",
        address: initialData.address || initialState.address,
      };
    }

    return initialState;
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested address fields
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = { ...formData };

    // Remove empty optional fields
    if (!cleanedData.birthday) delete cleanedData.birthday;
    if (!cleanedData.anniversary) delete cleanedData.anniversary;
    if (!cleanedData.lastInteractionDate)
      delete cleanedData.lastInteractionDate;
    if (!cleanedData.nextFollowUpDate) delete cleanedData.nextFollowUpDate;
    if (!cleanedData.lastInteractionType)
      delete cleanedData.lastInteractionType;

    onSubmit(cleanedData);
  };

  const availableTags = ["Client", "Vendor", "Partner", "Friend", "Other"];

  return (
    <div className="mx-auto bg-white p-3 md:p-3 pb-20 rounded-lg">
      <form onSubmit={handleSubmit}>
        {/* 1. Basic Contact Information */}
        <SectionHeader
          title="1. Basic Contact Information"
          subtitle="Who is this contact?"
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

        {/* 2. Relationship & Tags */}
        <SectionHeader
          title="2. Relationship & Tags"
          subtitle="How do you know this contact?"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Select
            label="Relationship Type"
            name="relationshipType"
            value={formData.relationshipType}
            onChange={handleChange}
            options={["Business", "Personal", "Professional", "Mixed"]}
            className="md:col-span-3"
          />
          <div className="md:col-span-6">
            <Label>Contact Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    formData.tags.includes(tag)
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {formData.tags.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Selected: {formData.tags.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* 3. Social Profiles */}
        <SectionHeader
          title="3. Social Profiles"
          subtitle="Connect on social media"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="LinkedIn Profile"
            name="linkedInProfile"
            value={formData.linkedInProfile}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/..."
          />
          <Input
            label="Twitter Handle"
            name="twitterHandle"
            value={formData.twitterHandle}
            onChange={handleChange}
            placeholder="@username"
          />
          <Input
            label="Facebook Profile"
            name="facebookProfile"
            value={formData.facebookProfile}
            onChange={handleChange}
            placeholder="https://facebook.com/..."
          />
        </div>

        {/* 4. Important Dates */}
        <SectionHeader
          title="4. Important Dates"
          subtitle="Never miss a special occasion"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Birthday"
            name="birthday"
            type="date"
            value={formData.birthday}
            onChange={handleChange}
          />
          <Input
            label="Anniversary"
            name="anniversary"
            type="date"
            value={formData.anniversary}
            onChange={handleChange}
          />
        </div>

        {/* 5. Address Information */}
        <SectionHeader
          title="5. Address Information"
          subtitle="Where are they located?"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Input
            label="Street Address"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            className="md:col-span-6"
          />
          <Input
            label="City"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Input
            label="State/Province"
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Input
            label="ZIP/Postal Code"
            name="address.zipCode"
            value={formData.address.zipCode}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Input
            label="Country"
            name="address.country"
            value={formData.address.country}
            onChange={handleChange}
            className="md:col-span-3"
          />
        </div>

        {/* 6. Business Information */}
        <SectionHeader
          title="6. Business Information"
          subtitle="Company details"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
          />
          <Select
            label="Company Size"
            name="companySize"
            value={formData.companySize}
            onChange={handleChange}
            options={["1-10", "11-50", "51-200", "201-500", "500+", "Unknown"]}
          />
          <Input
            label="Annual Revenue"
            name="annualRevenue"
            value={formData.annualRevenue}
            onChange={handleChange}
            placeholder="e.g., $1M-$5M"
          />
        </div>

        {/* 7. Interaction Tracking */}
        <SectionHeader
          title="7. Interaction Tracking"
          subtitle="Keep track of engagements"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Input
            label="Last Interaction Date"
            name="lastInteractionDate"
            type="date"
            value={formData.lastInteractionDate}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Select
            label="Last Interaction Type"
            name="lastInteractionType"
            value={formData.lastInteractionType}
            onChange={handleChange}
            options={[
              "Call",
              "Email",
              "Meeting",
              "WhatsApp",
              "Other",
              "None",
            ].map((opt) => ({ label: opt, value: opt === "None" ? "" : opt }))}
            className="md:col-span-2"
          />
          <Input
            label="Next Follow-Up Date"
            name="nextFollowUpDate"
            type="date"
            value={formData.nextFollowUpDate}
            onChange={handleChange}
            className="md:col-span-2"
          />
        </div>

        {/* 8. Communication Preferences */}
        <SectionHeader
          title="8. Communication Preferences"
          subtitle="How they want to be contacted"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Select
            label="Preferred Contact Mode"
            name="preferredContactMode"
            value={formData.preferredContactMode}
            onChange={handleChange}
            options={["Call", "WhatsApp", "Email", "Meeting"]}
            className="md:col-span-2"
          />
          <Input
            label="Preferred Time"
            name="preferredContactTime"
            placeholder="e.g. Morning, After 6PM"
            value={formData.preferredContactTime}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Input
            label="Timezone"
            name="timezone"
            placeholder="e.g. EST, IST"
            value={formData.timezone}
            onChange={handleChange}
            className="md:col-span-2"
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

        {/* 9. Notes */}
        <SectionHeader title="9. Notes & Comments" />
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

        {/* 10. Status */}
        <SectionHeader title="10. Contact Status" />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={["Active", "Inactive", "Archived"]}
            className="md:col-span-3"
          />
          <div className="md:col-span-3 flex items-center space-x-2 py-2">
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
            Save Contact
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;

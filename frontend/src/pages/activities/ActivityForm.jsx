import React, { useState } from "react";
import Label from "../../components/common/fields/Label";
import Input from "../../components/common/fields/Input";
import Select from "../../components/common/fields/Select";
import TextArea from "../../components/common/fields/TextArea";
import ContactAutocomplete from "../../components/common/fields/ContactAutocomplete";
import LeadAutocomplete from "../../components/common/fields/LeadAutocomplete";
import SectionHeader from "../../components/common/sections/SectionHeader";

import serviceService from "../../services/serviceService";

const ActivityForm = ({ initialData, onSubmit, onCancel }) => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState(() => {
    const initialState = {
      // Basic Info
      relatedTo: "Contact",
      relatedId: "",
      relatedName: "",
      service: "", // New Field
      activityType: "Call",
      title: "",
      description: "",
      notes: "",

      // Call Details
      callDetails: {
        duration: "",
        callType: "Outgoing",
        callStatus: "Completed",
      },

      // Meeting Details
      meetingDetails: {
        location: "",
        meetingType: "In-Person",
        attendees: [],
        agenda: "",
      },

      // Date and Time
      activityDate: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",

      // Status and Priority
      status: "Scheduled",
      priority: "Medium",

      // Outcome
      outcome: "None",
      followUpRequired: false,
      followUpDate: "",
      followUpNotes: "",

      // Tags and Category
      tags: [],
      category: "General",

      // User
      createdBy: "System",
    };

    if (initialData) {
      return {
        ...initialState,
        ...initialData,
        service: initialData.service?._id || initialData.service || "",
        activityDate: initialData.activityDate
          ? initialData.activityDate.split("T")[0]
          : initialState.activityDate,
        followUpDate: initialData.followUpDate
          ? initialData.followUpDate.split("T")[0]
          : "",
        callDetails: initialData.callDetails || initialState.callDetails,
        meetingDetails:
          initialData.meetingDetails || initialState.meetingDetails,
      };
    }

    return initialState;
  });

  // Fetch Services
  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceService.getServices({ isActive: true });
        setServices(res.data);
      } catch (err) {
        console.error("Failed to load services", err);
      }
    };
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested callDetails fields
    if (name.startsWith("callDetails.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        callDetails: {
          ...prev.callDetails,
          [field]: value,
        },
      }));
    }
    // Handle nested meetingDetails fields
    else if (name.startsWith("meetingDetails.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        meetingDetails: {
          ...prev.meetingDetails,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleRelatedChange = (selectedItem) => {
    if (selectedItem) {
      setFormData((prev) => ({
        ...prev,
        relatedId: selectedItem._id,
        relatedName: selectedItem.name,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        relatedId: "",
        relatedName: "",
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

    // Validate required fields
    if (!formData.relatedId || !formData.relatedName) {
      alert("Please select a contact or lead");
      return;
    }

    const cleanedData = { ...formData };

    // Remove empty optional fields
    if (!cleanedData.followUpDate) delete cleanedData.followUpDate;
    if (!cleanedData.startTime) delete cleanedData.startTime;
    if (!cleanedData.endTime) delete cleanedData.endTime;

    // Clean call details if not a call
    if (formData.activityType !== "Call") {
      delete cleanedData.callDetails;
    }

    // Clean meeting details if not a meeting
    if (formData.activityType !== "Meeting") {
      delete cleanedData.meetingDetails;
    }

    onSubmit(cleanedData);
  };

  const availableTags = [
    "Important",
    "Follow-up",
    "Urgent",
    "Completed",
    "Pending",
  ];

  return (
    <div className="mx-auto bg-white p-3 md:p-3 pb-20 rounded-lg">
      <form onSubmit={handleSubmit}>
        {/* 1. Basic Activity Information */}
        <SectionHeader
          title="1. Basic Activity Information"
          subtitle="What type of activity is this?"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Select
            label="Related To"
            name="relatedTo"
            value={formData.relatedTo}
            onChange={handleChange}
            options={["Contact", "Lead"]}
            className="md:col-span-2"
            required
          />

          <div className="md:col-span-4">
            {formData.relatedTo === "Contact" ? (
              <ContactAutocomplete
                label="Select Contact"
                value={formData.relatedId}
                onChange={handleRelatedChange}
                required
              />
            ) : (
              <LeadAutocomplete
                label="Select Lead"
                value={formData.relatedId}
                onChange={handleRelatedChange}
                required
              />
            )}
          </div>

          <Select
            label="Activity Type"
            name="activityType"
            value={formData.activityType}
            onChange={handleChange}
            options={[
              { label: "📞 Call", value: "Call" },
              { label: "🤝 Meeting", value: "Meeting" },
              { label: "✉️ Email", value: "Email" },
              { label: "💬 WhatsApp", value: "WhatsApp" },
              { label: "📝 Note", value: "Note" },
              { label: "✅ Task", value: "Task" },
              { label: "📋 Other", value: "Other" },
            ]}
            className="md:col-span-2"
            required
          />

          <div className="md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Service (Optional)
            </label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="">-- Select Service --</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.serviceName}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief title for this activity"
            className="md:col-span-6" // Changed to span full width to look better
            required
          />

          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            placeholder="Detailed description of the activity"
            className="md:col-span-6"
          />
        </div>

        {/* 2. Call Details (Only for Call type) */}
        {formData.activityType === "Call" && (
          <>
            <SectionHeader
              title="2. Call Details"
              subtitle="Information about the call"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Duration"
                name="callDetails.duration"
                value={formData.callDetails.duration}
                onChange={handleChange}
                placeholder="e.g., 15 minutes"
              />
              <Select
                label="Call Type"
                name="callDetails.callType"
                value={formData.callDetails.callType}
                onChange={handleChange}
                options={["Incoming", "Outgoing", "Missed"]}
              />
              <Select
                label="Call Status"
                name="callDetails.callStatus"
                value={formData.callDetails.callStatus}
                onChange={handleChange}
                options={["Completed", "No Answer", "Busy", "Failed"]}
              />
            </div>
          </>
        )}

        {/* 3. Meeting Details (Only for Meeting type) */}
        {formData.activityType === "Meeting" && (
          <>
            <SectionHeader
              title="3. Meeting Details"
              subtitle="Information about the meeting"
            />
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Input
                label="Location"
                name="meetingDetails.location"
                value={formData.meetingDetails.location}
                onChange={handleChange}
                placeholder="Meeting location or link"
                className="md:col-span-3"
              />
              <Select
                label="Meeting Type"
                name="meetingDetails.meetingType"
                value={formData.meetingDetails.meetingType}
                onChange={handleChange}
                options={["In-Person", "Video Call", "Phone Call"]}
                className="md:col-span-3"
              />
              <TextArea
                label="Agenda"
                name="meetingDetails.agenda"
                value={formData.meetingDetails.agenda}
                onChange={handleChange}
                rows={2}
                placeholder="Meeting agenda or topics"
                className="md:col-span-6"
              />
            </div>
          </>
        )}

        {/* 4. Date & Time */}
        <SectionHeader
          title={`${formData.activityType === "Call" || formData.activityType === "Meeting" ? "4" : "2"}. Date & Time`}
          subtitle="When did/will this activity occur?"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Activity Date"
            name="activityDate"
            type="date"
            value={formData.activityDate}
            onChange={handleChange}
            required
          />
          <Input
            label="Start Time"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
          />
          <Input
            label="End Time"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
          />
        </div>

        {/* 5. Status & Priority */}
        <SectionHeader
          title={`${formData.activityType === "Call" || formData.activityType === "Meeting" ? "5" : "3"}. Status & Priority`}
          subtitle="Current status and importance"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={["Scheduled", "Completed", "Cancelled", "Pending"]}
            className="md:col-span-2"
          />
          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={["Low", "Medium", "High", "Urgent"]}
            className="md:col-span-2"
          />
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={["Sales", "Support", "Follow-up", "General", "Other"]}
            className="md:col-span-2"
          />
        </div>

        {/* 6. Outcome & Follow-up */}
        <SectionHeader
          title={`${formData.activityType === "Call" || formData.activityType === "Meeting" ? "6" : "4"}. Outcome & Follow-up`}
          subtitle="What was the result?"
        />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Select
            label="Outcome"
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            options={[
              "Positive",
              "Neutral",
              "Negative",
              "Follow-up Required",
              "None",
            ]}
            className="md:col-span-3"
          />

          <div className="md:col-span-3 flex items-center space-x-2 py-2">
            <input
              type="checkbox"
              id="followUpRequired"
              name="followUpRequired"
              checked={formData.followUpRequired}
              onChange={handleChange}
              className="h-5 w-5 text-black rounded border-gray-300 focus:ring-black"
            />
            <label
              htmlFor="followUpRequired"
              className="text-sm font-medium text-gray-700"
            >
              Follow-up Required
            </label>
          </div>

          {formData.followUpRequired && (
            <>
              <Input
                label="Follow-up Date"
                name="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={handleChange}
                className="md:col-span-3"
              />
              <TextArea
                label="Follow-up Notes"
                name="followUpNotes"
                value={formData.followUpNotes}
                onChange={handleChange}
                rows={2}
                className="md:col-span-6"
              />
            </>
          )}
        </div>

        {/* 7. Notes & Tags */}
        <SectionHeader
          title={`${formData.activityType === "Call" || formData.activityType === "Meeting" ? "7" : "5"}. Notes & Tags`}
          subtitle="Additional information"
        />
        <div className="grid grid-cols-1 gap-4">
          <TextArea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any additional notes or comments"
          />

          <div>
            <Label>Tags</Label>
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
            Save Activity
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;

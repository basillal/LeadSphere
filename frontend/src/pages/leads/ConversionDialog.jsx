import React, { useState } from "react";

const ConversionDialog = ({ lead, onConfirm, onCancel }) => {
  const [tags, setTags] = useState(["Client"]);
  const [relationshipType, setRelationshipType] = useState("Business");

  const availableTags = ["Client", "Vendor", "Partner", "Friend", "Other"];

  const handleTagToggle = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = () => {
    onConfirm({ tags, relationshipType });
  };

  if (!lead) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Convert Lead to Contact
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Converting: <span className="font-semibold">{lead.name}</span>
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Tags Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Contact Tags <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    tags.includes(tag)
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {tags.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Selected: {tags.join(", ")}
              </p>
            )}
            {tags.length === 0 && (
              <p className="text-xs text-red-500 mt-2">
                Please select at least one tag
              </p>
            )}
          </div>

          {/* Relationship Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Relationship Type <span className="text-red-500">*</span>
            </label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="Business">Business</option>
              <option value="Personal">Personal</option>
              <option value="Professional">Professional</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">What happens next:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>A new contact will be created with all lead data</li>
                  <li>The lead status will be updated to "Converted"</li>
                  <li>You can manage the contact in the Contacts page</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={tags.length === 0}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Convert to Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionDialog;

import React, { useState } from "react";

const ConversionDialog = ({ lead, categories = [], onConfirm, onCancel, inline = false }) => {
  const [tags, setTags] = useState(["Client"]);
  const [category, setCategory] = useState(
    typeof lead.category === 'object' ? lead.category?._id : lead.category || ""
  );

  const availableTags = ["Client", "Vendor", "Partner", "Friend", "Other"];

  const handleTagToggle = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = () => {
    onConfirm({ tags, category });
  };

  if (!lead) return null;

  const content = (
    <div
      className={`bg-white shadow-sm w-full ${inline ? 'border border-gray-200 rounded-xl max-w-4xl' : 'rounded-md max-w-md'}`}
      onClick={!inline ? (e) => e.stopPropagation() : undefined}
    >
      {/* Header */}
      <div className={`px-6 py-5 border-b border-gray-100 ${inline ? 'rounded-t-xl' : ''}`}>
        <h2 className="text-xl font-bold text-gray-900">
          Convert Lead to Contact
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Converting: <span className="font-semibold text-gray-800">{lead.name}</span>
        </p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            Assigned Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-gray-50/50"
          >
            <option value="">None</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
            Contact Tags <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-transform transform active:scale-95 ${
                  tags.includes(tag)
                    ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
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
            <div>
              <p className="font-bold mb-1 text-blue-900 uppercase text-xs tracking-wider">Succession Plan</p>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-blue-800/90 font-medium">
                <li>Original Lead will be archived as <span className="font-semibold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded">Converted</span></li>
                <li>A permanent Contact profile will be created</li>
                <li>Relationship category and tags will be retained</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 ${inline ? 'rounded-b-xl' : 'rounded-b-md'}`}>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-gray-600 font-medium text-sm hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={tags.length === 0}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Convert to Contact
        </button>
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
      <div className="relative z-10 w-full max-w-md">
        {content}
      </div>
    </div>
  );
};

export default ConversionDialog;

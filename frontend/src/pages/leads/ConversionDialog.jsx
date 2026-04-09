import React, { useState } from "react";

const ConversionDialog = ({ lead, categories = [], onConfirm, onCancel }) => {
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
          <h2 className="text-base font-light text-black">
            Convert Lead to Contact
          </h2>
          <p className="text-base text-black mt-1">
            Converting: <span className="font-light">{lead.name}</span>
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-base font-light text-black mb-2 uppercase tracking-tight text-base text-black">
              Assigned Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base bg-gray-50"
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
            <label className="block text-base font-light text-black mb-3 uppercase tracking-tight text-base text-black">
              Contact Tags <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-lg font-light text-base transition-transform transform active:scale-95 ${
                    tags.includes(tag)
                      ? "bg-black text-white shadow-md shadow-black/10"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-xl">
            <div className="flex">
              <svg
                className="w-5 h-5 text-black mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-base text-black">
                <p className="font-light mb-1 text-white uppercase text-base tracking-widest opacity-60">Succession Plan</p>
                <ul className="list-disc list-inside space-y-1 text-base font-light leading-relaxed">
                  <li>Original Lead will be archived as <span className="text-white">Converted</span></li>
                  <li>A permanent Contact profile will be created</li>
                  <li>Relationship category and tags will be retained</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-black font-light text-base hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={tags.length === 0}
            className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 font-light text-base transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Convert to Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionDialog;

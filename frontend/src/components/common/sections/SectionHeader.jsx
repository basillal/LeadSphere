import React from "react";

const SectionHeader = ({ title, subtitle, actionButton }) => (
  <div className="mb-4 mt-8 border-b border-gray-200 pb-2 flex justify-between items-center">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
    {actionButton && (
      <button
        onClick={actionButton.onClick}
        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
      >
        {actionButton.label}
      </button>
    )}
  </div>
);

export default SectionHeader;

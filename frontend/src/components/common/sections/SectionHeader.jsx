import React from "react";

const SectionHeader = ({ title, subtitle, actionButton }) => (
  <div className="mb-4 mt-8 border-b border-slate-200 pb-2 flex justify-between items-center">
    <div>
      <h3 className="text-sm font-medium text-slate-800">{title}</h3>
      {subtitle && <p className="text-base text-black">{subtitle}</p>}
    </div>
    {actionButton && (
      <button
        onClick={actionButton.onClick}
        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-base font-medium"
      >
        {actionButton.label}
      </button>
    )}
  </div>
);

export default SectionHeader;

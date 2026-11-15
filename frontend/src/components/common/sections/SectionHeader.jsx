import React from "react";

const SectionHeader = ({ title, subtitle, actionButton }) => (
  <div className="mb-3 mt-4 border-b border-gray-100 pb-2 flex justify-between items-center gap-3">
    <div>
      <h3 className="text-[12px] font-semibold text-gray-900 tracking-tight">{title}</h3>
      {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {actionButton && (
      <button
        type="button"
        onClick={actionButton.onClick}
        className="em-add h-[34px] px-4 inline-flex items-center text-[11px] font-medium"
      >
        {actionButton.label}
      </button>
    )}
  </div>
);

export default SectionHeader;
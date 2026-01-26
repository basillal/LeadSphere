import React from "react";

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-4 mt-8 border-b border-gray-200 pb-2">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </div>
);

export default SectionHeader;

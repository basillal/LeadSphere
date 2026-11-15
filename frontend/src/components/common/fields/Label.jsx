import React from "react";

const Label = ({ children, required }) => (
  <label className="block text-[10px] font-medium text-[#4A5565] mb-1 leading-[1.2]">
    {children} {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

export default Label;

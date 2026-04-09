import React from "react";

const Label = ({ children, required }) => (
  <label className="block text-base font-light text-black mb-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

export default Label;

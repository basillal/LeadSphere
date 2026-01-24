import React from "react";
import Label from "./Label";

const TextArea = ({
  label,
  name,
  value,
  onChange,
  rows = 3,
  className = "",
  ...props
}) => (
  <div className={className}>
    {label && <Label required={props.required}>{label}</Label>}
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
      {...props}
    />
  </div>
);

export default TextArea;

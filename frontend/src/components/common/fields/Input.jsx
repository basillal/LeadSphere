import React from "react";
import Label from "./Label";

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  className = "",
  ...props
}) => (
  <div className={className}>
    {label && <Label required={required}>{label}</Label>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
      required={required}
      {...props}
    />
  </div>
);

export default Input;

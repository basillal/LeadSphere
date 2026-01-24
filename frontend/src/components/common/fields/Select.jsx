import React from "react";
import Label from "./Label";

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  required,
  className = "",
  ...props
}) => (
  <div className={className}>
    {label && <Label required={required}>{label}</Label>}
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black appearance-none bg-white transition-colors"
        required={required}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {/* Custom Arrow Icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  </div>
);

export default Select;

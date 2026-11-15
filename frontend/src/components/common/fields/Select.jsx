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
        value={value ?? ""}
        onChange={onChange}
        className="w-full h-[34px] pl-3 pr-8 text-[11px] font-medium text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none appearance-none transition-all cursor-pointer"
        required={required}
        {...props}
      >
        {Array.isArray(options) &&
          !options.some((o) =>
            typeof o === "object" ? o.value === "" : o === ""
          ) && <option value="">Select option</option>}

        {options.map((opt, i) => (
          <option
            key={typeof opt === "object" ? opt.value || i : opt}
            value={typeof opt === "object" ? opt.value : opt}
          >
            {typeof opt === "object" ? opt.label : opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#6B7280]">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

export default Select;

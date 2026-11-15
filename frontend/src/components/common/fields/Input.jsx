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
  uppercaseOnly = false,
  ...props
}) => {
  const handleChange = (e) => {
    let v = e.target.value;
    if (uppercaseOnly) {
      v = v.toUpperCase().replace(/[^A-Z\s\-']/g, "");
    }

    if (onChange) {
      onChange({
        target: {
          name: e.target.name,
          value: v,
          type: e.target.type,
          checked: e.target.checked,
        },
      });
    }
  };

  return (
    <div className={className}>
      {label && <Label required={required}>{label}</Label>}
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={handleChange}
        className="w-full h-[34px] px-3 text-[11px] font-medium text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none placeholder:text-[#9CA3AF] transition-all"
        required={required}
        {...props}
      />
    </div>
  );
};

export default Input;

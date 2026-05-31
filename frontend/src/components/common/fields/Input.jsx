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
      // convert to uppercase and strip disallowed characters (allow spaces, hyphen, apostrophe)
      v = v.toUpperCase().replace(/[^A-Z\s\-']/g, "");
    }

    if (onChange) {
      // Send a simple, stable event-like object expected by parent handlers
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
        value={value}
        onChange={handleChange}
        className="w-full px-2 py-1.5 md:px-3 md:py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
        required={required}
        {...props}
      />
    </div>
  );
};

export default Input;

import React from "react";
import Label from "./Label";

const TextArea = ({
  label,
  name,
  value,
  onChange,
  rows = 3,
  className = "",
  placeholder = "",
  ...props
}) => (
  <div className={className}>
    {label && <Label required={props.required}>{label}</Label>}
    <textarea
      name={name}
      value={value ?? ""}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full p-2.5 text-[11px] font-medium text-[#111827] bg-white border border-[#D1D5DB] rounded-[10px] outline-none min-h-[72px] resize-none placeholder:text-[#9CA3AF] transition-all"
      {...props}
    />
  </div>
);

export default TextArea;

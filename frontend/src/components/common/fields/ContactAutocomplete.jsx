import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "./Autocomplete";
import contactService from "../../../services/contactService";

/**
 * ContactAutocomplete - Specialized autocomplete for selecting contacts
 * Uses the generic Autocomplete component with contact-specific configuration
 */
const ContactAutocomplete = ({
  label = "Select Contact",
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
}) => {
  // Fetch contacts with search and pagination
  const fetchContacts = async ({ search, page, limit }) => {
    const response = await contactService.getContacts({
      search,
      page,
      limit,
    });
    return response;
  };

  // Fetch single contact by ID
  const fetchSingleContact = async (id) => {
    const response = await contactService.getContact(id);
    return response;
  };

  // Format option label
  const getOptionLabel = (option) => {
    if (!option) return "";
    if (typeof option === "string") return option;
    return `${option.name || "Unknown"} - ${option.phone || "N/A"}${
      option.email ? ` (${option.email})` : ""
    }`;
  };

  // Custom render for dropdown options
  const renderOption = (props, option) => (
    <Box component="li" {...props} key={option._id}>
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="body2"
          fontWeight={500}
          sx={{ fontSize: "0.875rem" }}
        >
          {option.name || "Unknown"}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.75rem" }}
        >
          {option.phone || "N/A"}
          {option.email && ` • ${option.email}`}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Autocomplete
      label={label}
      placeholder="Search by name, phone, or email..."
      value={value}
      onChange={onChange}
      fetchOptions={fetchContacts}
      fetchSingleItem={fetchSingleContact}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      getOptionKey={(option) => option._id}
      required={required}
      disabled={disabled}
      pageSize={20}
      returnFullObject={true}
      noOptionsText="No contacts found"
      className={className}
    />
  );
};

export default ContactAutocomplete;

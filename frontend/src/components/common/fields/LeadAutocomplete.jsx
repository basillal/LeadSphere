import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "./Autocomplete";
import leadService from "../../../services/leadService";

/**
 * LeadAutocomplete - Specialized autocomplete for selecting leads
 * Uses the generic Autocomplete component with lead-specific configuration
 */
const LeadAutocomplete = ({
  label = "Select Lead",
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
}) => {
  // Fetch leads with search and pagination
  const fetchLeads = async ({ search, page, limit }) => {
    const response = await leadService.getLeads({
      search,
      page,
      limit,
    });
    return response;
  };

  // Fetch single lead by ID
  const fetchSingleLead = async (id) => {
    const response = await leadService.getLead(id);
    return response;
  };

  // Format option label
  const getOptionLabel = (option) => {
    if (!option) return "";
    if (typeof option === "string") return option;
    return `${option.name || "Unknown"} - ${option.companyName || "N/A"} ${
      option.phone ? `(${option.phone})` : ""
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
          {option.companyName || "N/A"}
          {option.phone && ` • ${option.phone}`}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Autocomplete
      label={label}
      placeholder="Search by name, company, or phone..."
      value={value}
      onChange={onChange}
      fetchOptions={fetchLeads}
      fetchSingleItem={fetchSingleLead}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      getOptionKey={(option) => option._id}
      required={required}
      disabled={disabled}
      pageSize={20}
      returnFullObject={true}
      noOptionsText="No leads found"
      className={className}
    />
  );
};

export default LeadAutocomplete;

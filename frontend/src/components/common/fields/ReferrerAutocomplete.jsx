import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "./Autocomplete";
import referrerService from "../../../services/referrerService";

/**
 * ReferrerAutocomplete - Specialized autocomplete for selecting referrers
 * Uses the generic Autocomplete component with referrer-specific configuration
 */
const ReferrerAutocomplete = ({
  label = "Referred By",
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
}) => {
  // Fetch referrers with search and pagination
  const fetchReferrers = async ({ search, page, limit }) => {
    const response = await referrerService.getReferrers({
      search,
      page,
      limit,
    });
    return response;
  };

  // Fetch single referrer by ID
  const fetchSingleReferrer = async (id) => {
    const response = await referrerService.getReferrerById(id);
    return response;
  };

  // Format option label
  const getOptionLabel = (option) => {
    if (!option) return "";
    if (typeof option === "string") return option;
    return `${option.name || "Unknown"} - ${option.phone || "N/A"}${
      option.organizationName ? ` (${option.organizationName})` : ""
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
          {option.organizationName && ` • ${option.organizationName}`}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Autocomplete
      label={label}
      placeholder="Search by name, phone, or organization..."
      value={value}
      onChange={onChange}
      fetchOptions={fetchReferrers}
      fetchSingleItem={fetchSingleReferrer}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      getOptionKey={(option) => option._id}
      required={required}
      disabled={disabled}
      pageSize={20}
      returnFullObject={true}
      noOptionsText="No referrers found"
      className={className}
    />
  );
};

export default ReferrerAutocomplete;

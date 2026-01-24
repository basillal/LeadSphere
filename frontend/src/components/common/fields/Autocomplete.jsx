import React, { useState, useEffect, useCallback } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { debounce } from "@mui/material/utils";
import Label from "./Label";

/**
 * Autocomplete - A reusable searchable, paginated dropdown component
 * Matches the design of Input and Select components
 */
const AutocompleteField = ({
  label,
  placeholder = "Search...",
  value,
  onChange,
  fetchOptions,
  fetchSingleItem,
  getOptionLabel,
  renderOption,
  getOptionKey = (option) => option._id || option.id,
  required = false,
  disabled = false,
  pageSize = 20,
  returnFullObject = false,
  noOptionsText = "No options found",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch options with search and pagination
  const loadOptions = useCallback(
    async (search = "", pageNum = 1, append = false) => {
      setLoading(true);
      try {
        const response = await fetchOptions({
          search,
          page: pageNum,
          limit: pageSize,
        });

        const newOptions = response.data || response || [];

        if (append) {
          setOptions((prev) => [...prev, ...newOptions]);
        } else {
          setOptions(newOptions);
        }

        setHasMore(newOptions.length === pageSize);
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchOptions, pageSize],
  );

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((search) => {
      setPage(1);
      loadOptions(search, 1, false);
    }, 300),
    [loadOptions],
  );

  // Initial load when dropdown opens
  useEffect(() => {
    if (open && options.length === 0) {
      loadOptions("", 1, false);
    }
  }, [open, loadOptions]);

  // Load selected item if value is provided
  useEffect(() => {
    const loadSelectedItem = async () => {
      if (
        value &&
        typeof value === "string" &&
        !selectedItem &&
        fetchSingleItem
      ) {
        try {
          const response = await fetchSingleItem(value);
          setSelectedItem(response.data || response);
        } catch (error) {
          console.error("Error loading selected item:", error);
        }
      } else if (value && typeof value === "object") {
        setSelectedItem(value);
      } else if (!value) {
        setSelectedItem(null);
      }
    };
    loadSelectedItem();
  }, [value, fetchSingleItem]);

  // Handle search input change
  const handleInputChange = (event, newInputValue, reason) => {
    if (reason === "input") {
      setSearchQuery(newInputValue);
      debouncedSearch(newInputValue);
    }
  };

  // Handle selection change
  const handleChange = (event, newValue) => {
    setSelectedItem(newValue);
    if (returnFullObject) {
      onChange(newValue);
    } else {
      onChange(newValue ? getOptionKey(newValue) : "");
    }
  };

  // Handle scroll for infinite loading
  const handleScroll = (event) => {
    const listboxNode = event.currentTarget;
    const position = listboxNode.scrollTop + listboxNode.clientHeight;
    const bottom = listboxNode.scrollHeight - 10;

    if (position >= bottom && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadOptions(searchQuery, nextPage, true);
    }
  };

  // Default option label formatter
  const defaultGetOptionLabel = (option) => {
    if (!option) return "";
    if (typeof option === "string") return option;
    return option.name || option.label || option.title || String(option);
  };

  // Default option renderer
  const defaultRenderOption = (props, option) => (
    <Box component="li" {...props} key={getOptionKey(option)}>
      <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
        {getOptionLabel
          ? getOptionLabel(option)
          : defaultGetOptionLabel(option)}
      </Typography>
    </Box>
  );

  return (
    <div className={className}>
      {label && <Label required={required}>{label}</Label>}
      <Autocomplete
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={selectedItem}
        onChange={handleChange}
        onInputChange={handleInputChange}
        options={options}
        loading={loading}
        disabled={disabled}
        getOptionLabel={getOptionLabel || defaultGetOptionLabel}
        isOptionEqualToValue={(option, value) =>
          getOptionKey(option) === getOptionKey(value)
        }
        filterOptions={(x) => x}
        ListboxProps={{
          onScroll: handleScroll,
          style: { maxHeight: "300px" },
        }}
        slotProps={{
          popper: {
            placement: "bottom-start",
            modifiers: [
              {
                name: "flip",
                enabled: false,
              },
              {
                name: "preventOverflow",
                enabled: true,
                options: {
                  altAxis: true,
                  altBoundary: true,
                  tether: false,
                  rootBoundary: "viewport",
                  padding: 8,
                },
              },
            ],
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            required={required}
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.875rem",
                padding: "0",
                "& input": {
                  padding: "6px 12px",
                  "@media (min-width: 768px)": {
                    padding: "8px 12px",
                  },
                },
                "& fieldset": {
                  borderColor: "#d1d5db",
                  borderRadius: "0.5rem",
                },
                "&:hover fieldset": {
                  borderColor: "#000",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#000",
                  borderWidth: "2px",
                  boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.1)",
                },
              },
              "& .MuiAutocomplete-endAdornment": {
                right: "8px",
              },
            }}
          />
        )}
        renderOption={renderOption || defaultRenderOption}
        noOptionsText={
          loading
            ? "Loading..."
            : searchQuery
              ? noOptionsText
              : "Start typing to search"
        }
        sx={{
          "& .MuiAutocomplete-listbox": {
            fontSize: "0.875rem",
          },
        }}
      />
    </div>
  );
};

export default AutocompleteField;

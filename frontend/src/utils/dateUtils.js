/**
 * Centralized Date and Time formatting utilities for LeadSphere.
 * Formats dates into DD/MM/YY (e.g. 15/11/26) and date-times into DD/MM/YY, hh:mm A.
 */

/**
 * Format date to DD/MM/YY format (e.g., 15/11/26)
 * @param {Date|string|number} dateValue - The date to format
 * @param {string} fallback - Fallback string if date is missing or invalid
 * @returns {string} Formatted date string in DD/MM/YY
 */
export const formatDate = (dateValue, fallback = "-") => {
  if (!dateValue) return fallback;

  // If date-only string in YYYY-MM-DD format, avoid timezone shift by parsing directly
  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("-");
      return `${day}/${month}/${year.slice(-2)}`;
    }
  }

  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return fallback;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
};

/**
 * Format date and time to DD/MM/YY, hh:mm A format (e.g., 15/11/26, 03:30 PM)
 * @param {Date|string|number} dateValue - The date to format
 * @param {string} fallback - Fallback string if date is missing or invalid
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateValue, fallback = "-") => {
  if (!dateValue) return fallback;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return fallback;

  const datePart = formatDate(d, fallback);
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart}, ${timePart}`;
};

/**
 * Format time to hh:mm A format (e.g., 03:30 PM)
 * @param {Date|string|number} dateValue - The date to format
 * @param {string} fallback - Fallback string if date is missing or invalid
 * @returns {string} Formatted time string
 */
export const formatTime = (dateValue, fallback = "-") => {
  if (!dateValue) return fallback;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return fallback;

  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default {
  formatDate,
  formatDateTime,
  formatTime,
};

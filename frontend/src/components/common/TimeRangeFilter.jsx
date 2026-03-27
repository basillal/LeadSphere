import React from 'react';

/**
 * Utility to get ISO date range strings based on a range identifier
 */
export const getDateRange = (range) => {
    const today = new Date();
    // Normalize to the start of the current minute to ensure stability 
    // for multiple calls made in quick succession (like React.StrictMode)
    today.setSeconds(0, 0); 
    let endDate = today.toISOString();
    let startDate = null;

    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      startDate = start.toISOString();
    } else if (range === "this_month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = start.toISOString();
    } else if (range === "this_year") {
      const start = new Date(today.getFullYear(), 0, 1);
      startDate = start.toISOString();
    } else if (range === "last_30_days") {
      const start = new Date();
      start.setDate(today.getDate() - 30);
      startDate = start.toISOString();
    } else if (range && !isNaN(range) && range.length === 4) {
      const year = parseInt(range);
      const start = new Date(year, 0, 1);
      startDate = start.toISOString();
      if (year < today.getFullYear()) {
        endDate = new Date(year, 11, 31, 23, 59, 59, 999).toISOString();
      }
    }
    // "all_time" returns null startDate
    return { startDate, endDate };
};

const TimeRangeFilter = ({ value, onChange, className = "" }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-black focus:border-black block p-2.5 min-w-[150px] ${className}`}
    >
      <option value="last_30_days">Last 30 Days</option>
      <option value="today">Today</option>
      <option value="this_month">This Month</option>
      <option value="this_year">This Year</option>
      <option value="2026">2026</option>
      <option value="2025">2025</option>
      <option value="2024">2024</option>
      <option value="all_time">All Time</option>
    </select>
  );
};

export default TimeRangeFilter;

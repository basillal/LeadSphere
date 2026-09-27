import React from 'react';

/**
 * Utility to get ISO date range strings based on a range identifiers
 */
export const getDateRange = (range) => {
    const now = new Date();
    let endDate = now.toISOString();
    let startDate = null;

    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      startDate = start.toISOString();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      endDate = end.toISOString();
    } else if (range === "this_month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = start.toISOString();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      endDate = end.toISOString();
    } else if (range === "this_year") {
      const start = new Date(now.getFullYear(), 0, 1);
      startDate = start.toISOString();
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      endDate = end.toISOString();
    } else if (range === "last_30_days") {
      const start = new Date();
      start.setDate(now.getDate() - 30);
      startDate = start.toISOString();
    } else if (range === "all_time") {
      return { startDate: null, endDate: null };
    } else if (range && !isNaN(range) && range.length === 4) {
      const year = parseInt(range);
      const start = new Date(year, 0, 1);
      startDate = start.toISOString();
      endDate = new Date(year, 11, 31, 23, 59, 59, 999).toISOString();
    }
    
    return { startDate, endDate };
};

const TimeRangeFilter = ({ value, onChange, className = "" }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "white",
        border: "1.5px solid #E2E8F0",
        color: "#0F172A",
        fontSize: "0.82rem",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        borderRadius: "8px",
        padding: "0.45rem 0.875rem",
        minWidth: "145px",
        outline: "none",
        cursor: "pointer",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "#4F46E5";
        e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#E2E8F0";
        e.target.style.boxShadow = "0 1px 2px rgba(15,23,42,0.04)";
      }}
      className={className}
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

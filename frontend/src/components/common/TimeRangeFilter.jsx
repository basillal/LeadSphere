import React from 'react';

/**
 * Utility to get ISO date range strings based on a range identifier
 */
export const getDateRange = (range) => {
    const now = new Date();
    let endDate = now.toISOString();
    let startDate = null;

    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      startDate = start.toISOString();
    } else if (range === "this_month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = start.toISOString();
    } else if (range === "this_year") {
      const start = new Date(now.getFullYear(), 0, 1);
      startDate = start.toISOString();
    } else if (range === "last_30_days") {
      const start = new Date();
      start.setDate(now.getDate() - 30);
      startDate = start.toISOString();
    } else if (range && !isNaN(range) && range.length === 4) {
      const year = parseInt(range);
      const start = new Date(year, 0, 1);
      startDate = start.toISOString();
      if (year < now.getFullYear()) {
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
      className={`bg-white/90 border border-slate-200 text-slate-900 text-sm md:text-base rounded-2xl focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400 block px-4 py-2.5 min-w-[150px] shadow-sm ${className}`}
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

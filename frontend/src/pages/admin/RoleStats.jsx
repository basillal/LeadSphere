import React from "react";

const RoleStats = ({ stats }) => {
  const StatCard = ({ title, value, bgColor, textColor, icon }) => (
    <div
      className={`${bgColor} p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-600 text-sm font-medium uppercase tracking-wide">
          {title}
        </span>
        {icon && <div className={`${textColor} opacity-80`}>{icon}</div>}
      </div>
      <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total Roles"
        value={stats.total || 0}
        bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
        textColor="text-blue-700"
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        }
      />
      <StatCard
        title="System Roles"
        value={stats.system || 0}
        bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
        textColor="text-indigo-700"
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        }
      />
      <StatCard
        title="Custom Roles"
        value={stats.custom || 0}
        bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
        textColor="text-amber-700"
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        }
      />
    </div>
  );
};

export default RoleStats;

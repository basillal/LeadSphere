import React from "react";

const UserStats = ({ stats }) => {
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
        title="Total Users"
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
      />
      <StatCard
        title="Active Users"
        value={stats.active || 0}
        bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
        textColor="text-emerald-700"
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
      <StatCard
        title="Inactive Users"
        value={stats.inactive || 0}
        bgColor="bg-gradient-to-br from-rose-50 to-rose-100"
        textColor="text-rose-700"
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
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
    </div>
  );
};

export default UserStats;

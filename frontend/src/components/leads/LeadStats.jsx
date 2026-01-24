import React from "react";

const LeadStats = ({ stats }) => {
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <StatCard
        title="Total Leads"
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
        title="New"
        value={stats.new || 0}
        bgColor="bg-gradient-to-br from-slate-50 to-slate-100"
        textColor="text-slate-700"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        }
      />
      <StatCard
        title="Contacted"
        value={stats.contacted || 0}
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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        }
      />
      <StatCard
        title="Follow-up"
        value={stats.followUp || 0}
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
      <StatCard
        title="Converted"
        value={stats.converted || 0}
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
        title="Lost"
        value={stats.lost || 0}
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

export default LeadStats;

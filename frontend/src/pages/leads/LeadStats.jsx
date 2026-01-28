import React from "react";

const LeadStats = ({ stats }) => {
  const StatCard = ({ title, value, icon, iconBg, iconColor }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-gray-300">
      <div className="flex items-center gap-4">
        <div className={`${iconBg} ${iconColor} p-3 rounded-lg`}>{icon}</div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total"
        value={stats.total || 0}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
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
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            />
            <circle cx="9" cy="7" r="4" />
          </svg>
        }
      />
      <StatCard
        title="Converted"
        value={stats.converted || 0}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
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
        title="New"
        value={stats.new || 0}
        iconBg="bg-slate-100"
        iconColor="text-slate-600"
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
        title="Pending"
        value={stats.pending || 0}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
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
        title="In Progress"
        value={stats.inProgress || 0}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        }
      />
      <StatCard
        title="On Hold"
        value={stats.onHold || 0}
        iconBg="bg-orange-100"
        iconColor="text-orange-600"
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
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
      <StatCard
        title="Completed"
        value={stats.completed || 0}
        iconBg="bg-green-100"
        iconColor="text-green-600"
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        }
      />
      <StatCard
        title="Lost"
        value={stats.lost || 0}
        iconBg="bg-rose-100"
        iconColor="text-rose-600"
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

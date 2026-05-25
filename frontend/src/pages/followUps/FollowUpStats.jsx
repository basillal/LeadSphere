import React from "react";

const FollowUpStats = ({ stats, mobileMode = false }) => {
  const StatCard = ({ title, value, icon, iconBg, iconColor, percentage }) => (
    <div className="bg-white p-1.5 sm:p-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-gray-300 relative overflow-hidden">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className={`${iconBg} ${iconColor} p-1.5 sm:p-2 rounded-lg flex-shrink-0`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] sm:text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5 truncate">
            {title}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-black leading-tight">{value}</p>
          {percentage && (
            <p className="text-[8px] sm:text-[9px] text-gray-500 mt-0.5 uppercase font-light truncate">
              {percentage}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const totalTasks = stats.total || 0;
  const pendingPercentage =
    totalTasks > 0 ? Math.round((stats.pending / totalTasks) * 100) : 0;
  const completedPercentage =
    totalTasks > 0 ? Math.round((stats.completed / totalTasks) * 100) : 0;

  return (
    <div className={mobileMode ? "grid grid-cols-2 gap-2 mb-4" : "hidden md:grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6"}>
      <StatCard
        title="Total Follow-ups"
        value={stats.total || 0}
        iconBg="bg-slate-100"
        iconColor="text-black"
        icon={
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        }
      />
      <StatCard
        title="Pending Today"
        value={stats.pending || 0}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        percentage={`${pendingPercentage}% of total`}
        icon={
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
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
        title="Completed"
        value={stats.completed || 0}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        percentage={`${completedPercentage}% done`}
        icon={
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
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
        title="Missed/Overdue"
        value={stats.missed || 0}
        iconBg="bg-rose-100"
        iconColor="text-rose-600"
        percentage={stats.missed > 0 ? "Needs attention" : "All on track"}
        icon={
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        }
      />
    </div>
  );
};

export default FollowUpStats;

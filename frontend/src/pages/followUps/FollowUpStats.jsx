import React from "react";

const FollowUpStats = ({ stats }) => {
  const StatCard = ({ title, value, bgPattern, textColor, percentage }) => (
    <div
      className={`relative overflow-hidden ${bgPattern} p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all`}
    >
      <div className="relative z-10">
        <p className={`text-sm font-semibold ${textColor} opacity-90 mb-2`}>
          {title}
        </p>
        <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
        {percentage && (
          <p className={`text-xs ${textColor} opacity-75 mt-2`}>{percentage}</p>
        )}
      </div>
      <div className="absolute top-0 right-0 opacity-10">
        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
    </div>
  );

  const totalTasks = stats.total || 0;
  const pendingPercentage =
    totalTasks > 0 ? Math.round((stats.pending / totalTasks) * 100) : 0;
  const completedPercentage =
    totalTasks > 0 ? Math.round((stats.completed / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Follow-ups"
        value={stats.total || 0}
        bgPattern="bg-gradient-to-br from-slate-100 to-slate-200"
        textColor="text-slate-800"
      />
      <StatCard
        title="Pending Today"
        value={stats.pending || 0}
        bgPattern="bg-gradient-to-br from-blue-100 to-blue-200"
        textColor="text-blue-800"
        percentage={`${pendingPercentage}% of total`}
      />
      <StatCard
        title="Completed"
        value={stats.completed || 0}
        bgPattern="bg-gradient-to-br from-green-100 to-green-200"
        textColor="text-green-800"
        percentage={`${completedPercentage}% done`}
      />
      <StatCard
        title="Missed/Overdue"
        value={stats.missed || 0}
        bgPattern="bg-gradient-to-br from-red-100 to-red-200"
        textColor="text-red-800"
        percentage={stats.missed > 0 ? "Needs attention" : "All on track"}
      />
    </div>
  );
};

export default FollowUpStats;

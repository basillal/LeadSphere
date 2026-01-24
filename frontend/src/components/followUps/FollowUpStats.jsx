import React from "react";

const StatCard = ({ title, value, color }) => (
  <div
    className={`p-4 rounded-lg bg-white border border-gray-200 shadow-sm flex flex-col`}
  >
    <span className="text-gray-500 text-sm font-medium">{title}</span>
    <span className={`text-2xl font-bold mt-2 ${color}`}>{value}</span>
  </div>
);

const FollowUpStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Follow-ups"
        value={stats.total || 0}
        color="text-gray-900"
      />
      <StatCard
        title="Pending Today"
        value={stats.pending || 0}
        color="text-blue-600"
      />
      <StatCard
        title="Completed"
        value={stats.completed || 0}
        color="text-green-600"
      />
      <StatCard
        title="Missed/Overdue"
        value={stats.missed || 0}
        color="text-red-600"
      />
    </div>
  );
};

export default FollowUpStats;

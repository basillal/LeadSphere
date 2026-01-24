import React from "react";

const StatCard = ({ title, value, color, icon }) => (
  <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm flex flex-col">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-500 text-sm font-medium">{title}</span>
      {icon && <span className="text-gray-400">{icon}</span>}
    </div>
    <span className={`text-2xl font-bold ${color}`}>{value}</span>
  </div>
);

const ContactStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <StatCard
        title="Total Contacts"
        value={stats.total || 0}
        color="text-gray-900"
      />
      <StatCard
        title="Clients"
        value={stats.clients || 0}
        color="text-blue-600"
      />
      <StatCard
        title="Vendors"
        value={stats.vendors || 0}
        color="text-purple-600"
      />
      <StatCard
        title="Partners"
        value={stats.partners || 0}
        color="text-green-600"
      />
      <StatCard
        title="Friends"
        value={stats.friends || 0}
        color="text-orange-600"
      />
      <StatCard
        title="Recent (7d)"
        value={stats.recentInteractions || 0}
        color="text-indigo-600"
      />
    </div>
  );
};

export default ContactStats;

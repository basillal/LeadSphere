import React from "react";

const ReferrerStats = ({ stats }) => {
  const StatCard = ({ title, value, subtitle, borderColor }) => (
    <div
      className={`bg-white p-5 rounded-xl border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
          {title}
        </span>
        <span className="text-3xl font-bold text-gray-900 mb-1">{value}</span>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <StatCard
        title="Total Referrers"
        value={stats.totalReferrers || 0}
        borderColor="border-violet-500"
        subtitle="All referrers"
      />
      <StatCard
        title="Active"
        value={stats.activeReferrers || 0}
        borderColor="border-emerald-500"
        subtitle="Currently active"
      />
      <StatCard
        title="Total Leads"
        value={stats.totalLeadsReferred || 0}
        borderColor="border-sky-500"
        subtitle="Referred leads"
      />
      <StatCard
        title="Converted"
        value={stats.convertedLeads || 0}
        borderColor="border-teal-500"
        subtitle="Success stories"
      />
      <StatCard
        title="Conversion"
        value={`${stats.avgConversionRate || 0}%`}
        borderColor="border-amber-500"
        subtitle="Average rate"
      />
      <StatCard
        title="Recent"
        value={stats.recentReferrals || 0}
        borderColor="border-rose-500"
        subtitle="Last 7 days"
      />
    </div>
  );
};

export default ReferrerStats;

import React from "react";

const ReferrerStats = ({ stats, mobileMode = false }) => {
  const StatCard = ({ title, value, icon, iconBg, iconColor }) => (
    <div className="bg-white p-3.5 rounded-[20px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-[10px] ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wider truncate mb-0.5">
            {title}
          </p>
          <p className="text-[17px] font-bold text-gray-900 leading-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={mobileMode ? "grid grid-cols-2 gap-2 mb-3" : "hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-4"}>
      <StatCard
        title="Total Referrers"
        value={stats.totalReferrers || 0}
        iconBg="bg-orange-50"
        iconColor="text-[var(--primary)]"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
      />
      <StatCard
        title="Active"
        value={stats.activeReferrers || 0}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <StatCard
        title="Total Leads"
        value={stats.totalLeadsReferred || 0}
        iconBg="bg-sky-50"
        iconColor="text-sky-600"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
      />
      <StatCard
        title="Converted"
        value={stats.convertedLeads || 0}
        iconBg="bg-teal-50"
        iconColor="text-teal-600"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 5.04M12 2.944c1.25 0 2.455.19 3.584.542m-7.168 0A11.947 11.947 0 005.403 6m13.194 0c-.339 2.272-1.254 4.354-2.597 6.13M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12s4.03 8.25 9 8.25z" />
          </svg>
        }
      />
      <StatCard
        title="Conversion"
        value={`${stats.avgConversionRate || 0}%`}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />
      <StatCard
        title="Recent (7d)"
        value={stats.recentReferrals || 0}
        iconBg="bg-rose-50"
        iconColor="text-rose-600"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
};

export default ReferrerStats;
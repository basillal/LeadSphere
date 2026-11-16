import React from "react";

const ReferrerStats = ({ stats = {}, mobileMode = false }) => {
  const conversionRate = stats.avgConversionRate || 0;

  return (
    <div
      className={
        mobileMode
          ? "grid grid-cols-2 gap-2 mb-3 font-inter"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 font-inter"
      }
    >
      {/* 1. Partner Roster */}
      <div className="bg-white p-3.5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Affiliate Network
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            {stats.activeReferrers || 0} Active
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[20px] font-bold text-gray-900 leading-tight">
            {stats.totalReferrers || 0}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            Registered Partners
          </span>
        </div>
      </div>

      {/* 2. Referral Pipeline */}
      <div className="bg-white p-3.5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Referred Pipeline
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            {stats.convertedLeads || 0} Won Deals
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[20px] font-bold text-gray-900 leading-tight">
            {stats.totalLeadsReferred || 0}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            Total Leads Introduced
          </span>
        </div>
      </div>

      {/* 3. Conversion Success Rate */}
      <div className="bg-white p-3.5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Conversion Efficiency
          </span>
          <span className="text-[10.5px] font-bold text-emerald-600">
            {conversionRate}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-1.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              conversionRate >= 40
                ? "bg-emerald-500"
                : conversionRate >= 20
                  ? "bg-[var(--primary)]"
                  : "bg-amber-400"
            }`}
            style={{ width: `${Math.min(conversionRate, 100)}%` }}
          />
        </div>
        <span className="text-[9.5px] text-gray-400 font-medium">
          Ratio of referred leads converted to clients
        </span>
      </div>

      {/* 4. Recent Momentum */}
      <div className="bg-white p-3.5 rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            7-Day Activity
          </span>
          <div className="w-5 h-5 rounded-md bg-[#FFF1EB] text-[var(--primary)] flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[20px] font-bold text-gray-900 leading-tight">
            +{stats.recentReferrals || 0}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            New leads this week
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReferrerStats;

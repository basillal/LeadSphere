import React from "react";

const RoleStats = ({ stats }) => {
  const StatCard = ({ title, value, iconBg, iconColor, icon }) => (
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
      <StatCard
        title="Total Roles"
        value={stats.total || 0}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
      />
      <StatCard
        title="System Roles"
        value={stats.system || 0}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
      />
      <StatCard
        title="Custom Roles"
        value={stats.custom || 0}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
      />
    </div>
  );
};

export default RoleStats;